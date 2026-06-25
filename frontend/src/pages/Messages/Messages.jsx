import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Search, Send, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getConversations, getMessages, sendMessage } from "../../services/messageService";
import { useAuth } from "../../context/AuthContext";
import "./Messages.css";

const MOCK_MESSAGES = [
  { id: 101, text: "Hey! Are you picking up my Amazon parcel today?", sender: "other", time: "12:30 PM" },
  { id: 102, text: "Yes, I just picked it up. Should be there in 15 mins.", sender: "me", time: "12:35 PM" },
  { id: 103, text: "Awesome! Let me know when you reach.", sender: "other", time: "12:36 PM" },
  { id: 104, text: "I am near the hostel gate. Are you there?", sender: "other", time: "12:45 PM" },
];

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      if (data.length > 0 && !activeChat) {
        setActiveChat(data[0]);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (chat) => {
    if (!chat) return;
    try {
      const msgs = await getMessages(chat.request_id);
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchChatMessages(activeChat);
      const interval = setInterval(() => fetchChatMessages(activeChat), 3000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;
    
    setSending(true);
    try {
      await sendMessage(activeChat.request_id, input);
      setInput("");
      fetchChatMessages(activeChat);
      fetchConversations(); // refresh last message in sidebar
    } catch (err) {
      alert("Failed to send message: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        
        {/* Sidebar */}
        <div className="messages-sidebar">
          <div className="messages-sidebar-header">
            <button onClick={() => navigate("/dashboard")} className="messages-back-btn">
              <ArrowLeft size={20} />
            </button>
            <h2>Messages</h2>
          </div>
          
          <div className="messages-search">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search conversations..." />
          </div>

          <div className="chats-list">
            {loading ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "2rem" }}>Loading...</p>
            ) : conversations.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "2rem" }}>No active chats.</p>
            ) : (
              conversations.map(chat => (
                <div 
                  key={chat.request_id} 
                  className={`chat-item ${activeChat?.request_id === chat.request_id ? 'active' : ''}`}
                  onClick={() => setActiveChat(chat)}
                >
                  <div className="chat-avatar">
                    {chat.other_person.charAt(0)}
                  </div>
                  <div className="chat-info">
                    <div className="chat-header">
                      <h4>{chat.other_person}</h4>
                      <span className="chat-time">
                        {new Date(chat.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="chat-footer">
                      <p className="chat-last-message">{chat.lastMessage || chat.title}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {activeChat ? (
            <>
              <div className="chat-area-header">
                <div className="chat-user-info">
                  <div className="chat-avatar large">
                    {activeChat.other_person.charAt(0)}
                  </div>
                  <div>
                    <h3>{activeChat.other_person}</h3>
                    <span className="chat-status">{activeChat.title} ({activeChat.status})</span>
                  </div>
                </div>
                
                <div className="chat-actions">
                  <Link to={`/requests/${activeChat.request_id}`} className="icon-btn" title="View Request Details">
                    <MessageSquare size={18} />
                  </Link>
                </div>
              </div>

              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div style={{ margin: "auto", color: "var(--text-muted)", textAlign: "center" }}>
                    No messages yet. Say hello!
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_id === user.id;
                    const isAdmin = msg.sender_role === "admin";
                    return (
                      <div key={msg.id} className={`message-bubble-wrapper ${isMe ? 'sent' : 'received'}`}>
                        {!isMe && <div className="message-avatar-small">{msg.sender_name.charAt(0)}</div>}
                        
                        <div className={`message-bubble ${isMe ? 'sent' : 'received'}`} 
                             style={isAdmin && !isMe ? { background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239,68,68,0.3)" } : {}}>
                          {!isMe && isAdmin && (
                            <div style={{ fontSize: "0.7rem", color: "#ef4444", fontWeight: "bold", marginBottom: "4px" }}>
                              Admin
                            </div>
                          )}
                          <p>{msg.text}</p>
                          <span className="message-time">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-area" onSubmit={handleSend}>
                <input 
                  type="text" 
                  placeholder="Type your message here..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" className="send-btn" disabled={!input.trim() || sending}>
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              Select a conversation to start chatting
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
