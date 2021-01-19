import React, { useEffect, useState } from "react";
import Web3 from "web3";
import "./App.css";

function App() {
  const [networkType, setNetworkType] = useState("");
  const [account, setAccount] = useState("");
  const [token, setToken] = useState(null);
  const [tokenCount, setTokenCount] = useState("");
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
    const network = await web3.eth.net.getNetworkType();
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
    setNetworkType(network);

    // const token = new web3.eth.Contract(tokenABI, contractAddress)
  };

  const placeBet = (e) => {
    e.preventDefault();

    if (tokenCount === "") {
      alert("Enter number of tokens to bet.");
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
    console.log("bet placed.");
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
            placeholder="Number of tokens"
            onChange={(e) => setTokenCount(e.target.value)}
          />
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

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
