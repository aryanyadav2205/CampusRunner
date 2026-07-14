import React, { useState, useEffect } from "react";
import { Headphones, Search, HelpCircle, ChevronDown, Send, MessageCircle, Mail, Ticket, Clock, CheckCircle2, XCircle } from "lucide-react";
import { apiCall } from "../../services/api";
import "./Support.css";

const faqs = [
  {
    question: "How do I create a delivery request?",
    answer: "Go to your Dashboard and click on 'Create Request'. Fill in the pickup and drop-off details, set a reward, and submit!"
  },
  {
    question: "How are payments handled?",
    answer: "Payments are securely processed through your Campus Wallet. Once a delivery is completed, the reward is automatically transferred to the runner's wallet."
  },
  {
    question: "Can I cancel a request?",
    answer: "Yes, you can cancel an open request before a runner accepts it. If it's already accepted, you need to contact the runner via the Messages dashboard."
  },
  {
    question: "How do I become a runner?",
    answer: "Anyone with an active account can be a runner! Just visit the 'Available Runs' section and accept a delivery request that fits your schedule."
  }
];

export default function Support() {
  const [activeTab, setActiveTab] = useState("support"); // "support" or "tickets"
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Contact Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({ subject: "", message: "" });

  // Tickets State
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    if (activeTab === "tickets") {
      loadTickets();
    }
  }, [activeTab]);

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const data = await apiCall("/support/tickets");
      setTickets(data);
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleWithdrawTicket = async (ticketId) => {
    try {
      await apiCall(`/support/tickets/${ticketId}`, "PATCH", { status: "WITHDRAWN" });
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: "WITHDRAWN" } : t));
    } catch (err) {
      alert("Failed to withdraw ticket.");
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await apiCall("/support/tickets", "POST", formData);
      setSubmitSuccess(true);
      setFormData({ subject: "", message: "" });
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab("tickets"); // Switch to tickets tab to show the new ticket
      }, 3000);
    } catch (err) {
      alert(err.message || "Failed to send support request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="support-container">
      <div className="support-hero">
        <h1>
          <Headphones size={36} color="var(--primary-color)" />
          How can we help you?
        </h1>
        <p>Search our knowledge base or reach out to our support team directly. We are here to ensure your campus deliveries run smoothly.</p>
        
        <div className="support-search">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for answers (e.g. payments, delivery)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="support-tabs">
        <button 
          className={`support-tab ${activeTab === "support" ? "active" : ""}`}
          onClick={() => setActiveTab("support")}
        >
          <HelpCircle size={18} /> Support Center
        </button>
        <button 
          className={`support-tab ${activeTab === "tickets" ? "active" : ""}`}
          onClick={() => setActiveTab("tickets")}
        >
          <Ticket size={18} /> My Tickets
        </button>
      </div>

      {activeTab === "support" && (
        <div className="support-content-grid">
          {/* Left Column: FAQs */}
          <div className="faq-section">
            <h2><HelpCircle size={24} color="var(--primary-color)" /> Frequently Asked Questions</h2>
            
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}
                >
                  <div className="faq-question" onClick={() => toggleFaq(index)}>
                    {faq.question}
                    <ChevronDown size={20} className="chevron" />
                  </div>
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
                No FAQs found matching your search.
              </p>
            )}
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-section">
            <h2><MessageCircle size={24} color="var(--primary-color)" /> Contact Support</h2>
            
            <div className="contact-card">
              {submitSuccess ? (
                <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--success-color, #10b981)" }}>
                  <Mail size={48} style={{ marginBottom: "1rem" }} />
                  <h3>Ticket Created!</h3>
                  <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                    We'll email you at your registered address soon. Redirecting to your tickets...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="contact-form-group">
                    <label>Subject</label>
                    <input 
                      type="text" 
                      placeholder="Briefly describe your issue" 
                      required 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>
                  
                  <div className="contact-form-group">
                    <label>How can we help?</label>
                    <textarea 
                      placeholder="Provide details about your issue or question..." 
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="contact-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating Ticket..." : "Submit Ticket"}
                    {!isSubmitting && <Send size={16} />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "tickets" && (
        <div className="tickets-section">
          <h2><Ticket size={24} color="var(--primary-color)" style={{ verticalAlign: "bottom", marginRight: 8 }} /> Ticket History</h2>
          
          {loadingTickets ? (
            <div className="empty-tickets">
              <p>Loading your tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="empty-tickets">
              <Ticket size={48} style={{ marginBottom: "1rem", color: "var(--text-muted)", opacity: 0.5 }} />
              <h3>No tickets found</h3>
              <p>You haven't opened any support tickets yet.</p>
              <button 
                className="contact-submit-btn" 
                style={{ width: "auto", margin: "1.5rem auto 0" }}
                onClick={() => setActiveTab("support")}
              >
                Create a Ticket
              </button>
            </div>
          ) : (
            <div className="ticket-list">
              {tickets.map(ticket => (
                <div key={ticket.id} className="ticket-item">
                  <div className="ticket-info">
                    <div className="ticket-header">
                      <h3 className="ticket-subject">{ticket.subject}</h3>
                      <div className={`ticket-status-badge ${ticket.status.toLowerCase()}`}>
                        {ticket.status === "OPEN" ? <Clock size={14} /> : 
                         ticket.status === "CLOSED" ? <CheckCircle2 size={14} /> : 
                         <XCircle size={14} />}
                        {ticket.status}
                      </div>
                    </div>
                    <p className="ticket-message">{ticket.message}</p>
                    
                    {ticket.admin_reply && (
                      <div className="ticket-admin-reply">
                        <strong>Response from Support:</strong>
                        <p>{ticket.admin_reply}</p>
                      </div>
                    )}

                    <div className="ticket-date">
                      Ticket #{ticket.id} • Opened on {new Date(ticket.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  
                  <div className="ticket-actions">
                    {ticket.status === "OPEN" && (
                      <button 
                        className="ticket-close-btn"
                        onClick={() => handleWithdrawTicket(ticket.id)}
                      >
                        <XCircle size={16} /> Withdraw Request
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
