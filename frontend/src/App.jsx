import { useState } from "react";
import { connectWallet } from "./stellar";

function App() {
  const [status, setStatus] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
const [connected, setConnected] = useState(false);
  const [yesVotes, setYesVotes] = useState(0);
  const [noVotes, setNoVotes] = useState(0);

  async function handleConnectWallet() {
  const result = await connectWallet();

  if (result.success) {
    setConnected(true);
    setWalletAddress(result.address);
    setStatus("Wallet Connected Successfully");
  } else {
    setStatus(result.error);
  }
}

  return (
    <div style={{ padding: "30px" }}>
      <h1>Live Poll</h1>

      <button onClick={handleConnectWallet}>
  {connected ? "Wallet Connected" : "Connect Wallet"}
</button>

{connected && (
  <p>
    Connected Wallet: <strong>{walletAddress}</strong>
  </p>
)}

      <h2>Results</h2>

      <p>Yes Votes: {yesVotes}</p>
      <p>No Votes: {noVotes}</p>

      <button>Vote Yes</button>

      <button style={{ marginLeft: "10px" }}>
        Vote No
      </button>

      <h3>{status}</h3>
    </div>
  );
}

export default App;