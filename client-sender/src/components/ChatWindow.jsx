import React, { useCallback, useState } from "react";
import { createEditor, Editor } from "slate";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";

const INITIAL_VALUE = [{ type: "paragraph", children: [{ text: "" }] }];

const ChatWindow = ({ onSend, onNewChat, selectedChat, onLeaveSession }) => {
  const [editor] = useState(() => withReact(createEditor()));
  const [value, setValue] = useState(INITIAL_VALUE);

  const isMarkActive = (format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  const toggleMark = (format) => {
    if (isMarkActive(format)) Editor.removeMark(editor, format);
    else Editor.addMark(editor, format, true);
  };

  const renderLeaf = useCallback(({ attributes, children, leaf }) => {
    if (leaf.bold) children = <strong>{children}</strong>;
    if (leaf.italic) children = <em>{children}</em>;
    if (leaf.underline) children = <u>{children}</u>;
    return <span {...attributes}>{children}</span>;
  }, []);

  const handleSend = () => {
    const plainText = value
      .map((n) => n.children.map((c) => c.text).join(""))
      .join("\n")
      .trim();
    if (!plainText) return;
    const hasFormatting = value.some((n) =>
      n.children.some((c) => c.bold || c.italic || c.underline)
    );
    onSend({
      text: plainText,
      isRichText: hasFormatting,
      richTextContent: hasFormatting ? value : null,
    });
    setValue([{ type: "paragraph", children: [{ text: "" }] }]);
    ReactEditor.focus(editor);
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "-";
    const date = new Date(ts);
    return date.toLocaleString();
  };

    if(!selectedChat){
    return (
      <div className="chatwindow-container">
        <div className="no-chat-selected">
          <h2>No chat selected</h2>
          <p style={{color:"#3B3B3B"}}>Choose a chat to see the replies for your queries</p>
          <span style={{textAlign: "center"}}>OR </span>
        <button onClick={onNewChat}>Start New Chat</button>
        </div>
      </div>
    );
  }

  const {sessionId, status, createdAt, closedAt, messages = []} = selectedChat;

  const renderMessage = (message) => {
    if (!message.isRichText || !message.richTextContent) {
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
  };

  return (
    <div className="chatwindow-container">
      <div className="chatwindow-head-btn">
        <div className="chatwindow-header">
        <h2>Session: {selectedChat?.sessionId || "Not started"}</h2>
        <div className="chat-details">
          <span>Status: {status}</span>
          <span>
            Created:{" "}
            {formatTimestamp(createdAt)}
          </span>
          {status === "closed" && (
            <span>
              Closed: {formatTimestamp(closedAt)}
            </span>
          )}
        </div>
      </div>
        <button className="new-chat-btn" onClick={onNewChat}>
        Start New Chat
      </button>
        <button className="leave-chat-btn"
        onClick={() => {
          onLeaveSession?.(selectedChat.sessionId);
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
          messages.map((message, index) => (
            <div
              key={message._id || index}
              className={`message ${
                message.sender === "client" ? "sent" : "received"
              }`}
            >       
            <div className={`sender ${message.sender === "client" ? "client" : "admin"}`}>{message.sender === "client" ? "🙋🏻‍♂️ Customer" : "👨‍💻 Admin"}</div>       
              <div className="message-content">{renderMessage(message)}</div>
              <div className="message-time">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>

      {sessionId && (
        <div className="input-container">
          <div className="toolbar">
            <button
            className={isMarkActive("bold") ? "active" : ""}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleMark("bold");
              }}
            >
              <b>B</b>
            </button>
            <button
            className={isMarkActive("italic") ? "active" : ""}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleMark("italic");
              }}
            >
              <i>I</i>
            </button>
            <button
            className={isMarkActive("underline") ? "active" : ""}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleMark("underline");
              }}
            >
              <u>U</u>
            </button>
          </div>

          <div className="input-row">
            <div className="input">
              <Slate
            editor={editor}
            initialValue={INITIAL_VALUE}
            value={value}
            onChange={setValue}
          >
            <Editable
              className="message-input"
              placeholder="Type your message..."
              renderLeaf={renderLeaf}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) e.preventDefault();
              }}
            />
          </Slate>
            </div>
          <button onClick={handleSend} className="send-btn">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
