import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { tokenAbi, tokenAddress } from "./config/token";
import { gameAbi, gameAddress } from "./config/bettingGame";
import "./App.css";

function App() {
  // ************************************* states *****************************************
  const [networkType, setNetworkType] = useState("");
  const [account, setAccount] = useState("");
  const [token, setToken] = useState(null);
  const [game, setGame] = useState(null);

  const [isApproved, setIsApproved] = useState(false);
  const [isBetPlaced, setIsBetPlaced] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [reward, setReward] = useState(0);
  const [generatedNumber, setGeneratedNumber] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const [tokenCount, setTokenCount] = useState(50);
  const [selectedNumber, setSelectedNumber] = useState("");
  const [seed, setSeed] = useState("");

  useEffect(() => {
    window.ethereum.enable();
    window.ethereum.autoRefreshOnNetworkChange = false;
    loadBlockchainData();

    return () => {};
  }, []);

  // ************************************* load Data *****************************************
  const loadBlockchainData = async () => {
    console.log("load");
    // create web3 instance
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
    const network = await web3.eth.net.getNetworkType();
    const accounts = await web3.eth.getAccounts();

    const token = new web3.eth.Contract(tokenAbi, tokenAddress);
    const gameContract = new web3.eth.Contract(gameAbi, gameAddress);

    setAccount(accounts[0]);
    setNetworkType(network);
    setToken(token);
    setGame(gameContract);

    await updateBalance(token, accounts[0]);
  };

  // ************************************* Update balance *****************************************
  const updateBalance = async (token, account) => {
    const balance = await token.methods.balanceOf(account).call();
    setCurrentBalance(balance);
  };

  // ************************************* Place Bet *****************************************
  const placeBet = async (e) => {
    e.preventDefault();

    if (!isApproved) {
      alert("Approve 50 tokens to bet");
      return;
    }

    if (selectedNumber === "") {
      alert("Select a number on which you want to bet.");
      return;
    }

    if (selectedNumber >= 100) {
      alert("Select number below 99.");
      return;
    }

    if (seed === "") {
      alert("Enter a seed.");
      return;
    }

    console.log(selectedNumber, seed);

    try {
      setLoading(true);

      await game.methods
        .bet(selectedNumber, seed)
        .send({ from: account })
        .on("confirmation", function (confNumber, { events }) {
          setIsBetPlaced(true);
          const { Bet } = events;

          setReward(Bet.returnValues.reward);
          setIsWinner(Bet.returnValues.isWinner);
          setGeneratedNumber(Bet.returnValues.randomNumber);

          console.log(Bet);
          console.log("called");
        })
        .on("error", function (error) {
          console.log(error);
        });
      console.log("ouutside ON");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      updateBalance(token, account);
    }

    console.log("bet placed.");
  };

  // ************************************* approve tokens *****************************************
  const approveTokens = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      await token.methods
        .approve(gameAddress, 50)
        .send({ from: account })
        .once("receipt", (receipt) => {
          console.log("REceiPt", receipt);
        });
      // console.log("response", res);
      setIsApproved(true);
    } catch (err) {
      console.log(err);
      alert("error");
    } finally {
      setLoading(false);
    }
  };

  // ************************************* reset *****************************************
  const reset = (e) => {
    e.preventDefault();

    setIsApproved(false);
    setIsBetPlaced(false);
    setIsWinner(false);
    setReward(0);
    setLoading(false);
    setTokenCount(50);
    setSelectedNumber("");
    setSeed("");
  };

  // ************************************* JSX *****************************************
  return (
    <div className="App">
      <b>Betting Game dApp</b>
      <p>Network: {networkType}</p>
      <p>Account: {account}</p>
      <p>Current Balance: {currentBalance} APK</p>

      <button onClick={loadBlockchainData}>refresh</button>

      <form className="App__form" onSubmit={placeBet}>
        <div>
          <span>Tokens to Bet:</span>
          <input
            value={tokenCount}
            type="number"
            disabled
            placeholder="Number of tokens"
            onChange={(e) => setTokenCount(e.target.value)}
          />
          <button disabled={isApproved || loading} onClick={approveTokens}>
            {!isApproved && loading ? "wait..." : "Approve"}
          </button>
          {isApproved && <p>Approved 50 Tokens!!</p>}
        </div>
        <div>
          <span>Select a number (below 99):</span>
          <input
            value={selectedNumber}
            type="number"
            placeholder="Number"
            onChange={(e) => setSelectedNumber(e.target.value)}
          />
        </div>
        <div>
          <span>Enter Seed:</span>
          <input
            value={seed}
            type="number"
            placeholder="Seed"
            onChange={(e) => setSeed(e.target.value)}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={!isApproved || loading || isBetPlaced}
          >
            {isApproved && loading ? "wait..." : "Submit"}
          </button>
          <button disabled={!isBetPlaced} onClick={reset}>
            reset
          </button>
        </div>
      </form>
      {isBetPlaced && (
        <>
          <p>Generated Number: {generatedNumber}</p>
          <p>
            you {isWinner ? "Win" : "lose"}, Reward: {reward} APK{" "}
          </p>
        </>
      )}
    </div>
  );
}

export default App;
