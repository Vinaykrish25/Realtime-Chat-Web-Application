import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

const ChatWindow = ({ selectedChat, setSelectedChat }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!socket) return;
    socket.on("session-messages", ({ sessionId, messages }) => {
      if (selectedChat?.sessionId === sessionId) {
        setMessages(messages);
      }
    });

    socket.on("new-message", (message) => {
      if (message.sessionId === selectedChat?.sessionId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("session-messages");
      socket.off("new-message");
    };
  }, [socket, selectedChat]);

  const sendMessage = (text) => {
    if (!selectedChat || !text.trim()) return;
    socket.emit("send-message", {
      sessionId: selectedChat.sessionId,
      sender: "admin",
      text: text.trim(),
    });
    setInput("");
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "-";
    const date = new Date(ts);
    return date.toLocaleString();
  };

  const renderMessage = useCallback((message) => {
    if(!message.isRichText || !message.richTextContent) {
      return <span>{message.text}</span>;
    }
    return message.richTextContent.map((node, idx) => (
      <p key={idx}>
        {node.children.map((child, cIdx) => {
          let content = <span key={cIdx}>{child.text}</span>;
          if (child.bold) content = <strong key={cIdx}>{content}</strong>;
          if (child.italic) content = <em key={cIdx}>{content}</em>;
          if (child.underline) content = <u key={cIdx}>{content}</u>;
          return content;
        })}
      </p>
    ));
  }, []);

  const leaveSession = () =>{
  setSelectedChat(null);
  }


  if (!selectedChat) {
    return (
      <div className="chatwindow-container">
        <div className="no-chat-selected">
          <h2>No chat selected</h2>
          <p style={{color:"#3B3B3B"}}>Choose a chat to see the queries of the customers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chatwindow-container">
      <div className="chatwindow-head-btn">
        <div className="chatwindow-header">
        <h2>Session: {selectedChat.sessionId}</h2>
        <div className="chat-details">
          <span>Status: {selectedChat.status}</span>
          <span>
            Created: {new Date(selectedChat.createdAt).toLocaleString()}
          </span>
          {selectedChat.closedAt && (
            <span>
              Closed: {new Date(selectedChat.closedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>
       <button className="leave-chat-btn"
        onClick={() => {
          leaveSession?.(selectedChat.sessionId);
          window.localStorage.removeItem("selectedChat");
        }}
        >
          Leave this Chat
        </button>
      </div>
      <div className="chatarea">
        {messages.length === 0 ? (
        <div className="no-messages">
            <p>Chat Here ...💬 </p>
            <p>No Messages yet</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`message ${
                m.sender === "admin" ? "sent" : "received"
              }`}
            >
              <div className={`sender ${m.sender === "client" ? "client" : "admin"}`}>{m.sender === "admin" ? "👨🏻‍💻Admin" : "🙋🏻‍♂️Customer"}</div>
              <div className="message-content">{renderMessage(m)}</div>
              <div className="message-time">{formatTimestamp(m.timestamp)}</div>
            </div>
          ))
        )}
      </div>

      {selectedChat.status === "active" && (
        <div className="input-container">
          <input
          className="message-input"
            type="text"
            placeholder="Type your reply..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                sendMessage(input);
              }
            }}
          />
    <button onClick={() => sendMessage(input)} className="send-btn">Send</button>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
