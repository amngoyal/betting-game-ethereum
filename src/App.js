import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { tokenAbi, tokenAddress } from "./config/token";
import { gameAbi, gameAddress } from "./config/bettingGame";
import "./App.css";

function App() {
  const [networkType, setNetworkType] = useState("");
  const [account, setAccount] = useState("");
  const [token, setToken] = useState(null);
  const [game, setGame] = useState(null);
  const [web3, setWeb3] = useState(null);

  const [isApproved, setIsApproved] = useState(false);

  const [tokenCount, setTokenCount] = useState(50);
  const [selectedNumber, setSelectedNumber] = useState("");
  const [seed, setSeed] = useState("");

  useEffect(() => {
    window.ethereum.enable();
    window.ethereum.autoRefreshOnNetworkChange = false;
    loadBlockchainData();
    return () => {};
  }, []);

  const loadBlockchainData = async () => {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
    setWeb3(web3);
    const network = await web3.eth.net.getNetworkType();
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
    setNetworkType(network);

    const token = new web3.eth.Contract(tokenAbi, tokenAddress);
    const gameContract = new web3.eth.Contract(gameAbi, gameAddress);

    setToken(token);
    setGame(gameContract);
  };

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
      const res = await game.methods
        .bet(selectedNumber, seed)
        .send({ from: account })
        .once("receipt", (receipt) => {
          console.log("REceiPt", receipt);
        });
      // console.log("response", res);
    } catch (err) {
      console.log(err);
    }

    console.log("bet placed.");
  };

  const approveTokens = async (e) => {
    e.preventDefault();
    try {
      const res = await token.methods
        .approve(gameAddress, 50)
        .send({ from: account })
        .once("receipt", (receipt) => {
          console.log("REceiPt", receipt);
        });
      // console.log("response", res);
      setIsApproved(true);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      <b>Betting Game dApp</b>
      <p>Network: {networkType}</p>
      <p>Account: {account}</p>

      <form className="App__form" onSubmit={placeBet}>
        <div>
          <span>Enter Tokens:</span>
          <input
            value={tokenCount}
            type="number"
            disabled
            placeholder="Number of tokens"
            onChange={(e) => setTokenCount(e.target.value)}
          />
          <button disabled={isApproved} onClick={approveTokens}>
            Approve
          </button>
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
        <button type="submit" disabled={!isApproved}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default App;
