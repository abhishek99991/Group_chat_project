
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getMessages } from "../services/messageService";
import "./ChatWindow.css";

const ChatWindow = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [personalMessages, setPersonalMessages] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [chatMode, setChatMode] = useState("group");

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

  // Add group message without duplicates
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

  // Fetch previous group messages
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
        if (active) setLoading(false);
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
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setSocketStatus("Connected");
    });

    // Receive group messages
    socket.on("newMessage", (newMessage) => {
      console.log("Group message received:", newMessage);
      addMessage(newMessage);
    });

    // Receive personal messages
    socket.on("personal_message", (data) => {
      console.log("Personal message received:", data);

      setPersonalMessages((prevMessages) => [
        ...prevMessages,
        data,
      ]);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocketStatus("Disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setSocketStatus("Connection failed");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Join personal room
  const joinPersonalRoom = (recipientId) => {
    const socket = socketRef.current;

    if (!socket || !socket.connected) {
      setError("Socket is not connected");
      return;
    }

    if (!recipientId || recipientId === currentUserId) {
      setError("Please select a valid user");
      return;
    }

    socket.emit("join_room", { recipientId }, (response) => {
      console.log("Join room response:", response);

      if (response?.success) {
        setSelectedUserId(recipientId);
        setPersonalMessages([]);
        setError("");
      } else {
        setError(response?.message || "Unable to join room");
      }
    });
  };

  // Send personal message
  const sendPersonalMessage = (recipientId, messageText) => {
    const socket = socketRef.current;

    if (!socket || !socket.connected) {
      setError("Socket is not connected");
      return;
    }

    socket.timeout(5000).emit(
      "new_message",
      {
        recipientId,
        message: messageText,
      },
      (err, response) => {
        if (err) {
          setError("Personal message server timeout");
          return;
        }

        console.log("Personal message response:", response);

        if (response?.success) {
          setMessage("");
          setError("");
        } else {
          setError(
            response?.message || "Personal message failed"
          );
        }
      }
    );
  };

  // Send group or personal message
  const handleSend = (e) => {
    e.preventDefault();

    const messageText = message.trim();

    if (!messageText || sending) return;

    if (chatMode === "personal") {
      if (!selectedUserId) {
        setError("Please select a user first");
        return;
      }

      setSending(true);
      sendPersonalMessage(selectedUserId, messageText);
      setSending(false);
      return;
    }

    const socket = socketRef.current;

    if (!socket || !socket.connected) {
      setError("Socket is not connected. Please try again.");
      return;
    }

    setSending(true);
    setError("");

    socket.timeout(5000).emit(
      "sendMessage",
      { message: messageText },
      (err, response) => {
        setSending(false);

        if (err) {
          setError("Server did not respond. Please try again.");
          return;
        }

        if (response?.success) {
          setMessage("");

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

  // Display messages according to selected chat
  const displayedMessages =
    chatMode === "group" ? messages : personalMessages;

  return (
    <div className="chat-container">

      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {/* Group chat */}
        <div
          className={`contact ${
            chatMode === "group" ? "active-contact" : ""
          }`}
          onClick={() => {
            setChatMode("group");
            setError("");
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="avatar">G</div>
          <div>
            <h4>Group Chat</h4>
            <p>Welcome to the group!</p>
          </div>
        </div>

        {/* Personal chat */}
        <div style={{ padding: "15px" }}>
          <h4>Personal Chat</h4>

          <input
            type="text"
            placeholder="Enter recipient MongoDB ID"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          />

          <button
            type="button"
            onClick={() => {
              const recipientId = selectedUserId;
              setSelectedUserId("");
              joinPersonalRoom(recipientId);
            }}
          >
            Join Personal Chat
          </button>

          <button
            type="button"
            onClick={() => {
              setChatMode("personal");
              setError("");
            }}
          >
            Open Personal Chat
          </button>
        </div>
      </aside>

      {/* Chat section */}
      <main className="chat-main">

        {/* Header */}
        <header className="chat-header">
          <div className="avatar">
            {chatMode === "group" ? "G" : "P"}
          </div>

          <div>
            <h3>
              {chatMode === "group"
                ? "Group Chat"
                : "Personal Chat"}
            </h3>

            <span className="online-status">
              {socketStatus}
            </span>
          </div>
        </header>

        {/* Messages */}
        <section className="messages-area">
          {loading && chatMode === "group" && (
            <p>Loading messages...</p>
          )}

          {error && <p className="error">{error}</p>}

          {!loading && displayedMessages.length === 0 && (
            <p className="empty-chat">
              No messages yet. Start the conversation!
            </p>
          )}

          {displayedMessages.map((msg, index) => {
            const senderId = String(
              msg.sender?._id ||
              msg.sender ||
              msg.senderId ||
              ""
            );

            const isMyMessage = senderId === currentUserId;

            return (
              <div
                key={msg._id || `${msg.createdAt}-${index}`}
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
        <form className="message-form" onSubmit={handleSend}>
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
              socketStatus !== "Connected" ||
              (chatMode === "personal" && !selectedUserId)
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
