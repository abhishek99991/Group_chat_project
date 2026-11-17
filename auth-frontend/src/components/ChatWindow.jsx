
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

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
  const [socketStatus, setSocketStatus] = useState("Connecting...");

  const bottomRef = useRef(null);

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // Add message only if it doesn't already exist
  const addMessage = (newMessage) => {
    setMessages((prevMessages) => {
      const exists = prevMessages.some(
        (msg) => String(msg._id) === String(newMessage._id)
      );

      if (exists) return prevMessages;

      return [...prevMessages, newMessage].sort(
        (a, b) =>
          new Date(a.createdAt) - new Date(b.createdAt)
      );
    });
  };

  // Fetch previous messages from MongoDB
  useEffect(() => {
    let active = true;

    const fetchMessages = async () => {
      try {
        const response = await getMessages();

        if (active) {
          const oldMessages = Array.isArray(response.data)
            ? response.data
            : [];

          setMessages((prevMessages) => {
            const combined = [...oldMessages, ...prevMessages];

            const uniqueMessages = Array.from(
              new Map(
                combined.map((msg) => [
                  String(msg._id),
                  msg,
                ])
              ).values()
            );

            return uniqueMessages.sort(
              (a, b) =>
                new Date(a.createdAt) -
                new Date(b.createdAt)
            );
          });
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }

        if (active) {
          setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to load messages"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchMessages();

    return () => {
      active = false;
    };
  }, []);

  // Connect Socket.IO and receive live messages
 
useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("Please login first");
    return;
  }

  // Connect frontend to Socket.IO backend
  const socket = io("http://localhost:3000", {
    auth: {
      token: token,
    },
  });

  // Connection successful
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  // Receive messages from other users
  socket.on("newMessage", (newMessage) => {
    console.log("New message received:", newMessage);

    setMessages((prevMessages) => {
      const alreadyExists = prevMessages.some(
        (msg) => msg._id === newMessage._id
      );

      if (alreadyExists) {
        return prevMessages;
      }

      return [...prevMessages, newMessage];
    });
  });

  // Connection error
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  // Disconnect when component is removed
  return () => {
    socket.disconnect();
  };
}, []);

  // Automatically scroll to latest message
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
      setSending(true);
      setError("");

      const response = await sendMessage(message.trim());

      // Socket also sends this message.
      // addMessage prevents duplicates.
      if (response.success && response.data) {
        addMessage(response.data);
      }

      setMessage("");

    } catch (err) {
      console.error("Send message error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to send message"
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
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentUserId = String(
    currentUser?.id || currentUser?._id || ""
  );

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
              {socketStatus}
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
              msg.sender?._id || msg.sender || ""
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
