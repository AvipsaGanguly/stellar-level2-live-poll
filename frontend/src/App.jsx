import { useState, useEffect } from "react";
import { connectWallet, fetchVotes, castVote } from "./stellar";

function App() {
  const [status, setStatus] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [connected, setConnected] = useState(false);
  const [yesVotes, setYesVotes] = useState(0);
  const [noVotes, setNoVotes] = useState(0);
  const [loadingVotes, setLoadingVotes] = useState(true);

  // Load votes when the page loads
  useEffect(() => {
    async function loadVotes() {
      setLoadingVotes(true);
      const votes = await fetchVotes();
      setYesVotes(votes.yesVotes);
      setNoVotes(votes.noVotes);
      setLoadingVotes(false);
    }
    loadVotes();
  }, []);

  async function handleConnectWallet() {
    if (connected) {
      setConnected(false);
      setWalletAddress("");
      setStatus("Wallet Disconnected");
      return;
    }

    setStatus("Connecting Wallet...");
    const result = await connectWallet();

    if (result.success) {
      setConnected(true);
      setWalletAddress(result.address);
      setStatus("Wallet Connected Successfully");
    } else {
      setStatus(result.error);
    }
  }

  async function handleVote(choice) {
    if (!connected || !walletAddress) {
      setStatus("Error: Please connect your wallet first.");
      return;
    }

    setStatus("Status: Pending (Invoking Soroban contract and submitting transaction...)");

    try {
      const txHash = await castVote(walletAddress, choice);
      setStatus(`Status: Success (Tx Hash: ${txHash})`);
      
      // Reload votes after successful transaction
      const votes = await fetchVotes();
      setYesVotes(votes.yesVotes);
      setNoVotes(votes.noVotes);
    } catch (err) {
      setStatus(`Status: Failed (${err.message || err})`);
    }
  }

  // Derived values for stats and rendering
  const totalVotes = yesVotes + noVotes;
  const yesPercent = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;
  const noPercent = totalVotes > 0 ? Math.round((noVotes / totalVotes) * 100) : 0;
  const isPending = status.includes("Pending") || status.includes("Connecting");
  
  const truncatedAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  const txHashMatch = status.match(/Tx Hash: ([a-fA-F0-9]+)/);
  const txHash = txHashMatch ? txHashMatch[1] : null;

  return (
    <>
      {/* Hero Card */}
      <header className="glass-card hero-card animate-fade-in">
        <h1 className="hero-title">Stellar Live Poll</h1>
        <p className="hero-subtitle">
          Vote securely on Stellar Testnet using your Freighter Wallet.
        </p>
      </header>

      <div className="dapp-grid">
        {/* Wallet Card */}
        <section className="glass-card wallet-card animate-fade-in" aria-label="Wallet Status Card">
          <div>
            <div className="wallet-header">
              <div className="wallet-title-group">
                <div className="stellar-logo-icon" aria-label="Stellar Emblem">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Freighter Wallet</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stellar Network</p>
                </div>
              </div>
              
              {connected ? (
                <span className="badge badge-connected">
                  <span className="pulse-dot"></span> Connected
                </span>
              ) : (
                <span className="badge badge-disconnected">
                  Disconnected
                </span>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Account Address</p>
              <div className="address-box" title={walletAddress || "No wallet connected"}>
                <span>{connected ? truncatedAddress : "Not Connected"}</span>
                {connected && <span style={{ color: 'var(--success-green)', fontSize: '0.8rem', fontWeight: 600 }}>● Testnet</span>}
              </div>
            </div>
          </div>

          <button 
            className={`btn ${connected ? 'btn-disconnect' : 'btn-primary'}`}
            onClick={handleConnectWallet}
            disabled={isPending && status.includes("Connecting")}
            aria-label={connected ? "Disconnect Freighter Wallet" : "Connect Freighter Wallet"}
          >
            {status.includes("Connecting") && <span className="spinner"></span>}
            {connected ? "Disconnect Wallet" : "Connect Wallet"}
          </button>
        </section>

        {/* Poll Voting Card */}
        <section className="glass-card animate-fade-in" aria-label="Active Governance Proposal Card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Active Ecosystem Proposal</h2>
            <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', fontWeight: 600 }}>#SP-2026</span>
          </div>
          
          <p style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '16px', lineHeight: '1.4' }}>
            Should Stellar increase liquidity incentives for ecosystem developers?
          </p>

          <div className="vote-cards-grid">
            {/* YES CARD */}
            <div className="vote-card yes">
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success-green)' }}>👍 YES</span>
              <div className="vote-count">{loadingVotes ? "..." : yesVotes}</div>
              <button 
                className="btn btn-yes"
                onClick={() => handleVote("Yes")}
                disabled={isPending}
                aria-label="Vote Yes on Stellar liquidity incentives proposal"
              >
                {isPending && status.includes("Pending") && <span className="spinner"></span>}
                Vote Yes
              </button>
            </div>

            {/* NO CARD */}
            <div className="vote-card no">
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--danger-red)' }}>👎 NO</span>
              <div className="vote-count">{loadingVotes ? "..." : noVotes}</div>
              <button 
                className="btn btn-no"
                onClick={() => handleVote("No")}
                disabled={isPending}
                aria-label="Vote No on Stellar liquidity incentives proposal"
              >
                {isPending && status.includes("Pending") && <span className="spinner"></span>}
                Vote No
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Statistics Card */}
      <section className="glass-card animate-fade-in" aria-label="Poll Analytics and Statistics">
        <div className="progress-header">
          <span>Consensus Distribution</span>
          <span>YES {yesPercent}% — {noPercent}% NO</span>
        </div>
        
        <div className="progress-bar-container" aria-label="Vote progress bar">
          <div className="progress-yes" style={{ width: `${yesPercent}%` }}></div>
          <div className="progress-no" style={{ width: `${noPercent}%` }}></div>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-label">Total Votes</div>
            <div className="stat-value">{totalVotes}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Yes Approval</div>
            <div className="stat-value" style={{ color: 'var(--success-green)' }}>{yesPercent}%</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">No Approval</div>
            <div className="stat-value" style={{ color: 'var(--danger-red)' }}>{noPercent}%</div>
          </div>
        </div>
      </section>

      {/* Transaction Status Card */}
      {status && (
        <section className="glass-card status-card animate-fade-in" aria-label="Transaction Status Information">
          <div className="status-content">
            {status.includes("Pending") || status.includes("Connecting") ? (
              <div className="status-icon status-pending">
                <span className="spinner" style={{ borderColor: 'rgba(59, 130, 246, 0.4)', borderTopColor: '#3b82f6' }}></span>
              </div>
            ) : status.includes("Success") ? (
              <div className="status-icon status-success">✓</div>
            ) : (
              <div className="status-icon status-failed">✕</div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>
                {status.includes("Pending") ? "Transaction Pending" : status.includes("Success") ? "Transaction Confirmed" : "Notice / Status"}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {status}
              </div>

              {txHash && (
                <div style={{ marginTop: '10px' }}>
                  <a 
                    href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="explorer-btn"
                    aria-label="View transaction details on Stellar Expert Explorer"
                  >
                    View on Stellar Expert Explorer ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <div className="footer-item">
          <span>⚡</span> Powered by Stellar Soroban
        </div>
        <div className="footer-item">
          <span>🔒</span> Freighter Wallet Connected
        </div>
        <div className="footer-item">
          <span>🌐</span> Stellar Testnet
        </div>
      </footer>
    </>
  );
}

export default App;