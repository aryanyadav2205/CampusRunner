import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getWalletBalance, requestWithdrawal } from "../../services/walletService";
import { ArrowLeft, Wallet as WalletIcon, IndianRupee, ArrowUpRight, ArrowDownRight, RefreshCw, Send } from "lucide-react";
import "./Wallet.css";

export default function Wallet() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Withdrawal form state
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  const loadData = async () => {
    setError("");
    try {
      const data = await getWalletBalance();
      setBalance(data.balance);
      setTransactions(data.transactions);
      setWithdrawals(data.recent_withdrawals);
    } catch (err) {
      setError(err.message || "Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess("");
    
    if (parseFloat(amount) < 50) {
      setWithdrawError("Minimum withdrawal amount is ₹50.");
      return;
    }
    
    if (parseFloat(amount) > balance) {
      setWithdrawError("Insufficient balance.");
      return;
    }

    setWithdrawLoading(true);
    try {
      await requestWithdrawal(parseFloat(amount), upiId);
      setWithdrawSuccess(`Successfully requested withdrawal of ₹${amount}.`);
      setAmount("");
      setUpiId("");
      loadData(); // Refresh balance and history
    } catch (err) {
      setWithdrawError(err.message || "Failed to request withdrawal.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="wallet-page">
      <div className="wallet-container">
        {/* Header */}
        <div className="wallet-header">
          <button onClick={() => navigate(-1)} className="wallet-back-btn">
            <ArrowLeft size={20} />
          </button>
          <h2>My Wallet</h2>
          <button onClick={loadData} className="wallet-refresh-btn" title="Refresh">
            <RefreshCw size={18} className={loading ? "spin" : ""} />
          </button>
        </div>

        {error && (
          <div className="wallet-error-banner">
            {error}
          </div>
        )}

        {/* Balance Card */}
        <div className="wallet-balance-card">
          <div className="balance-info">
            <span className="balance-label">Available Balance</span>
            <div className="balance-amount">
              <IndianRupee size={32} />
              <span>{balance.toFixed(2)}</span>
            </div>
          </div>
          <div className="balance-icon">
            <WalletIcon size={48} />
          </div>
        </div>

        <div className="wallet-content-grid">
          {/* Withdrawal Form */}
          <div className="wallet-section">
            <h3>Withdraw to Bank</h3>
            <p className="section-desc">Transfer your earnings instantly via UPI.</p>
            
            <form onSubmit={handleWithdraw} className="withdraw-form">
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount (Min ₹50)"
                  min="50"
                  max={balance}
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. 9876543210@ybl"
                  required
                />
              </div>
              
              {withdrawError && <div className="form-error">{withdrawError}</div>}
              {withdrawSuccess && <div className="form-success">{withdrawSuccess}</div>}
              
              <button 
                type="submit" 
                className="withdraw-submit-btn"
                disabled={withdrawLoading || balance < 50}
              >
                {withdrawLoading ? "Processing..." : "Withdraw Funds"} <Send size={16} />
              </button>
            </form>
          </div>

          {/* Transaction History */}
          <div className="wallet-section">
            <h3>Recent Activity</h3>
            
            {loading ? (
              <p className="loading-text">Loading activity...</p>
            ) : transactions.length === 0 ? (
              <div className="empty-state">
                <p>No transactions yet.</p>
              </div>
            ) : (
              <div className="transactions-list">
                {transactions.map(tx => (
                  <div key={tx.id} className="transaction-item">
                    <div className={`tx-icon ${tx.transaction_type === 'CREDIT' ? 'credit' : 'debit'}`}>
                      {tx.transaction_type === 'CREDIT' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div className="tx-details">
                      <div className="tx-desc">{tx.description}</div>
                      <div className="tx-date">
                        {new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <div className={`tx-amount ${tx.transaction_type === 'CREDIT' ? 'credit' : 'debit'}`}>
                      {tx.transaction_type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Pending Withdrawals */}
        {withdrawals.length > 0 && (
          <div className="wallet-section" style={{ marginTop: '2rem' }}>
            <h3>Withdrawal Requests</h3>
            <div className="transactions-list">
              {withdrawals.map(wd => (
                <div key={wd.id} className="transaction-item">
                  <div className="tx-icon pending">
                    <RefreshCw size={20} />
                  </div>
                  <div className="tx-details">
                    <div className="tx-desc">Withdrawal to {wd.upi_id}</div>
                    <div className="tx-date">Status: <span className={`status-${wd.status.toLowerCase()}`}>{wd.status}</span></div>
                  </div>
                  <div className="tx-amount">
                    ₹{wd.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
