
import React, { useEffect, useRef, useState } from "react";

import {
  sendMessage,
  getMessages,
} from "../services/messageService";

import "./ChatWindow.css";

const ChatWindow = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // Fetch previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await getMessages();

        setMessages(
          Array.isArray(response.data) ? response.data : []
        );

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }

        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to load messages"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();

    if (!message.trim() || sending) return;

    try {
      setError("");
      setSending(true);

      const response = await sendMessage(message.trim());

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Message could not be saved"
        );
      }

      setMessages((prev) => [
        ...prev,
        response.data,
      ]);

      setMessage("");

    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      setError(
        err.response?.data?.message ||
        err.message ||
        "Message could not be sent"
      );
    } finally {
      setSending(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Format message time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chat-container">

      {/* Sidebar */}
      <aside className="chat-sidebar">

        <div className="sidebar-header">
          <h2>Messages</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>

        <div className="contact active-contact">
          <div className="avatar">G</div>

          <div>
            <h4>Group Chat</h4>
            <p>Welcome to the group!</p>
          </div>
        </div>

      </aside>

      {/* Chat Area */}
      <main className="chat-main">

        <header className="chat-header">

          <div className="avatar">G</div>

          <div>
            <h3>Group Chat</h3>
            <span className="online-status">
              Chat Room
            </span>
          </div>

        </header>

        {/* Messages */}
        <section className="messages-area">

          {loading && <p>Loading messages...</p>}

          {error && (
            <p className="error">{error}</p>
          )}

          {!loading && messages.length === 0 && (
            <p className="empty-chat">
              No messages yet. Start the conversation!
            </p>
          )}

          {messages.map((msg) => {
            const senderId = String(
              msg.sender?._id || msg.sender
            );

            const currentUserId = String(
              currentUser?.id || currentUser?._id || ""
            );

            const isMyMessage =
              senderId === currentUserId;

            return (
              <div
                key={msg._id}
                className={`message-row ${
                  isMyMessage ? "me" : "other"
                }`}
              >

                <div className="message-bubble">

                  {!isMyMessage && (
                    <strong className="sender-name">
                      {msg.sender?.name || "User"}
                    </strong>
                  )}

                  <p>{msg.message}</p>

                  <span className="message-time">
                    {formatTime(msg.createdAt)}
                  </span>

                </div>

              </div>
            );
          })}

          <div ref={bottomRef}></div>

        </section>

        {/* Message Input */}
        <form
          className="message-form"
          onSubmit={handleSend}
        >

          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
          />

          <button
            type="submit"
            disabled={sending || !message.trim()}
          >
            {sending ? "Sending..." : "Send ➤"}
          </button>

        </form>

      </main>

    </div>
  );
};

export default ChatWindow;
