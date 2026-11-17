
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getMessages } from "../services/messageService";
import "./ChatWindow.css";

const ChatWindow = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [socketStatus, setSocketStatus] = useState("Connecting...");

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const currentUserId = String(
    currentUser?.id || currentUser?._id || ""
  );

  // Add message without duplicates
  const addMessage = (newMessage) => {
    if (!newMessage?._id) return;

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

        if (!active) return;

        const oldMessages = Array.isArray(response.data)
          ? response.data
          : [];

        setMessages((prevMessages) => {
          const combined = [...oldMessages, ...prevMessages];

          const uniqueMessages = Array.from(
            new Map(
              combined.map((msg) => [String(msg._id), msg])
            ).values()
          );

          return uniqueMessages.sort(
            (a, b) =>
              new Date(a.createdAt) - new Date(b.createdAt)
          );
        });
      } catch (err) {
        console.error("Fetch messages error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }

        if (active) {
          setError(
            err.response?.data?.message ||
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

  // Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setSocketStatus("Disconnected");
      return;
    }

    const socket = io("http://localhost:3000", {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connected
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setSocketStatus("Connected");
    });

    // Receive new messages
    socket.on("newMessage", (newMessage) => {
      console.log("New message received:", newMessage);
      addMessage(newMessage);
    });

    // Disconnected
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocketStatus("Disconnected");
    });

    // Connection error
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setSocketStatus("Connection failed");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Automatically scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Send message using Socket.IO
  const handleSend = (e) => {
    e.preventDefault();

    const messageText = message.trim();

    if (!messageText || sending) return;

    const socket = socketRef.current;

    if (!socket || !socket.connected) {
      setError("Socket is not connected. Please try again.");
      return;
    }

    setSending(true);
    setError("");

    console.log("Sending message:", messageText);

    // Emit message to backend
    socket.timeout(5000).emit(
      "sendMessage",
      { message: messageText },
      (err, response) => {
        setSending(false);

        if (err) {
          console.error("Socket acknowledgement timeout:", err);
          setError("Server did not respond. Please try again.");
          return;
        }

        console.log("Server response:", response);

        if (response?.success) {
          setMessage("");

          // Add returned message as a fallback.
          // The newMessage event may already have added it.
          if (response.data) {
            addMessage(response.data);
          }
        } else {
          setError(
            response?.message || "Message sending failed"
          );
        }
      }
    );
  };

  // Logout
  const handleLogout = () => {
    socketRef.current?.disconnect();

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

  return (
    <div className="chat-container">

      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="contact active-contact">
          <div className="avatar">G</div>

          <div>
            <h4>Group Chat</h4>
            <p>Welcome to the group!</p>
          </div>
        </div>
      </aside>

      {/* Chat section */}
      <main className="chat-main">

        {/* Header */}
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

          {loading && (
            <p>Loading messages...</p>
          )}

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

        {/* Message input */}
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
            disabled={
              sending ||
              !message.trim() ||
              socketStatus !== "Connected"
            }
          >
            {sending ? "Sending..." : "Send ➤"}
          </button>
        </form>

      </main>
    </div>
  );
};

export default ChatWindow;
