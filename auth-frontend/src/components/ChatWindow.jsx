
import React, { useEffect, useRef, useState } from "react";
import "./ChatWindow.css";

const ChatWindow = () => {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! How are you?",
      sender: "other",
      time: "10:30 AM",
    },
    {
      id: 2,
      text: "I'm good. How about you?",
      sender: "me",
      time: "10:31 AM",
    },
    {
      id: 3,
      text: "I'm doing great!",
      sender: "other",
      time: "10:32 AM",
    },
  ]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message.trim(),
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  return (
    <div className="chat-container">

      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
        </div>

        <div className="contact active-contact">
          <div className="avatar">A</div>
          <div>
            <h4>Abhishek</h4>
            <p>Let's connect!</p>
          </div>
        </div>

        <div className="contact">
          <div className="avatar">R</div>
          <div>
            <h4>Rahul</h4>
            <p>See you tomorrow</p>
          </div>
        </div>

        <div className="contact">
          <div className="avatar">S</div>
          <div>
            <h4>Shivam</h4>
            <p>Thanks bro!</p>
          </div>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="chat-main">

        {/* Header */}
        <header className="chat-header">
          <div className="avatar">A</div>

          <div>
            <h3>Abhishek</h3>
            <span className="online-status">Online</span>
          </div>
        </header>

        {/* Messages */}
        <section className="messages-area">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${msg.sender}`}
            >
              <div className="message-bubble">
                <p>{msg.text}</p>
                <span className="message-time">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          <div ref={bottomRef}></div>
        </section>

        {/* Message Input */}
        <form className="message-form" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button type="submit">Send ➤</button>
        </form>

      </main>
    </div>
  );
};

export default ChatWindow;
