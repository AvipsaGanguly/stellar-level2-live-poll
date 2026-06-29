import { useState, useEffect } from "react";
import { connectWallet, fetchVotes, castVote } from "./stellar";

function App() {
  const [status, setStatus] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletName, setWalletName] = useState("Freighter Wallet");
  const [walletType, setWalletType] = useState("Freighter");
  const [connected, setConnected] = useState(false);
  const [yesVotes, setYesVotes] = useState(0);
  const [noVotes, setNoVotes] = useState(0);
  const [loadingVotes, setLoadingVotes] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [votingFor, setVotingFor] = useState(null);

  // Fetch votes and print stats to console
  async function refreshVoteStats() {
    const votes = await fetchVotes();
    setYesVotes(votes.yesVotes);
    setNoVotes(votes.noVotes);

    const total = votes.yesVotes + votes.noVotes;
    const yesP = total > 0 ? Math.round((votes.yesVotes / total) * 100) : 0;
    const noP = total > 0 ? Math.round((votes.noVotes / total) * 100) : 0;

    console.log("=== Stellar Live Poll Stats ===");
    console.log(`Yes Votes: ${votes.yesVotes} (${yesP}%)`);
    console.log(`No Votes: ${votes.noVotes} (${noP}%)`);
    console.log(`Total Votes: ${total}`);
    console.log("================================");
  }

  // Load votes when the page loads (initial pull)
  useEffect(() => {
    async function loadVotes() {
      setLoadingVotes(true);
      await refreshVoteStats();
      setLoadingVotes(false);
    }
    loadVotes();
  }, []);

  async function handleSelectWallet(selectedType) {
    setIsModalOpen(false);
    setStatus(`Connecting to ${selectedType}...`);
    const result = await connectWallet(selectedType);

    if (result.success) {
      setConnected(true);
      setWalletAddress(result.address);
      setWalletName(result.walletName || `${selectedType} Wallet`);
      setWalletType(selectedType);
      setStatus(`Connected to ${selectedType} Successfully`);
    } else {
      setStatus(result.error);
    }
  }

  function handleDisconnectWallet() {
    setConnected(false);
    setWalletAddress("");
    setStatus("Wallet Disconnected");
  }

  async function handleVote(choice) {
    if (!connected || !walletAddress) {
      setStatus("Error: Please connect your wallet first.");
      setIsModalOpen(true);
      return;
    }

    setVotingFor(choice);
    setStatus(`Status: Pending (Invoking contract via ${walletName}...)`);

    // Store previous votes for rollback if transaction fails
    const prevYes = yesVotes;
    const prevNo = noVotes;

    // Optimistically update counts and percentages in the UI immediately
    if (choice === "Yes") {
      setYesVotes((prev) => prev + 1);
    } else {
      setNoVotes((prev) => prev + 1);
    }

    const optYes = choice === "Yes" ? prevYes + 1 : prevYes;
    const optNo = choice === "No" ? prevNo + 1 : prevNo;
    const optTotal = optYes + optNo;
    const optYesP = optTotal > 0 ? Math.round((optYes / optTotal) * 100) : 0;
    const optNoP = optTotal > 0 ? Math.round((optNo / optTotal) * 100) : 0;

    console.log(`[Optimistic Update] Voted: ${choice}`);
    console.log(`Yes Votes: ${optYes} (${optYesP}%) | No Votes: ${optNo} (${optNoP}%)`);

    try {
      const txHash = await castVote(walletAddress, choice, walletType);
      setStatus(`Status: Success (Tx Hash: ${txHash})`);
      
      // Delay slightly for RPC state indexing, then load real votes
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await refreshVoteStats();
    } catch (err) {
      // Rollback to previous state on error
      setYesVotes(prevYes);
      setNoVotes(prevNo);
      setStatus(`Status: Failed (${err.message || err})`);
      
      console.log("[Rollback] Restored original votes due to transaction error");
      console.log(`Yes Votes: ${prevYes} | No Votes: ${prevNo}`);
    } finally {
      setVotingFor(null);
    }
  }

  // Derived values for stats and rendering
  const totalVotes = yesVotes + noVotes;
  const yesPercent = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;
  const noPercent = totalVotes > 0 ? Math.round((noVotes / totalVotes) * 100) : 0;
  const isConnecting = status.includes("Connecting");
  
  const truncatedAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  const txHashMatch = status.match(/Tx Hash: ([a-fA-F0-9]+)/);
  const txHash = txHashMatch ? txHashMatch[1] : null;

  const getWalletIcon = (name) => {
    if (name.includes("Albedo")) return { icon: "A", bg: "linear-gradient(135deg, #a855f7, #ec4899)" };
    if (name.includes("xBull")) return { icon: "X", bg: "linear-gradient(135deg, #10b981, #059669)" };
    if (name.includes("Rabet")) return { icon: "R", bg: "linear-gradient(135deg, #f59e0b, #d97706)" };
    return { icon: "F", bg: "linear-gradient(135deg, var(--primary-purple), var(--primary-cyan))" };
  };

  const activeIcon = getWalletIcon(walletName);

  return (
    <>
      {/* Multi-Wallet Selector Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Select Wallet Provider</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="wallet-options-list">
              <button className="wallet-option-btn" onClick={() => handleSelectWallet("Freighter")}>
                <div className="wallet-option-info">
                  <div className="wallet-option-icon" style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "#fff" }}>F</div>
                  <span>Freighter Wallet</span>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Extension</span>
              </button>

              <button className="wallet-option-btn" onClick={() => handleSelectWallet("xBull")}>
                <div className="wallet-option-info">
                  <div className="wallet-option-icon" style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>X</div>
                  <span>xBull Wallet</span>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Extension</span>
              </button>

              <button className="wallet-option-btn" onClick={() => handleSelectWallet("Albedo")}>
                <div className="wallet-option-info">
                  <div className="wallet-option-icon" style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", color: "#fff" }}>A</div>
                  <span>Albedo Wallet</span>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Web / Link</span>
              </button>

              <button className="wallet-option-btn" onClick={() => handleSelectWallet("Rabet")}>
                <div className="wallet-option-info">
                  <div className="wallet-option-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff" }}>R</div>
                  <span>Rabet Wallet</span>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Extension</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Card */}
      <header className="glass-card hero-card animate-fade-in">
        <h1 className="hero-title">Stellar Live Poll</h1>
        <p className="hero-subtitle">
          Vote securely on Stellar Testnet using your preferred Stellar Wallet.
        </p>
      </header>

      <div className="dapp-grid">
        {/* Wallet Card */}
        <section className="glass-card wallet-card animate-fade-in" aria-label="Wallet Status Card">
          <div>
            <div className="wallet-header">
              <div className="wallet-title-group">
                <div className="stellar-logo-icon" style={{ background: activeIcon.bg, color: "#fff" }}>
                  {activeIcon.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{connected ? walletName : "Stellar Wallet"}</h3>
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
            onClick={connected ? handleDisconnectWallet : () => setIsModalOpen(true)}
            disabled={isConnecting}
            aria-label={connected ? "Disconnect Wallet" : "Connect Wallet"}
          >
            {isConnecting && <span className="spinner"></span>}
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
                disabled={votingFor !== null}
                aria-label="Vote Yes on Stellar liquidity incentives proposal"
              >
                {votingFor === "Yes" && <span className="spinner"></span>}
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
                disabled={votingFor !== null}
                aria-label="Vote No on Stellar liquidity incentives proposal"
              >
                {votingFor === "No" && <span className="spinner"></span>}
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
          <span>🔒</span> Multi-Wallet Connector Active
        </div>
        <div className="footer-item">
          <span>🌐</span> Stellar Testnet
        </div>
      </footer>
    </>
  );
}

export default App;