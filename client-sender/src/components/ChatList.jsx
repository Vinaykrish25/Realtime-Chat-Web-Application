import React, { useEffect, useState } from "react";

const ChatList = ({ activeSessions = [], historySessions = [], selectedChat, setSelectedChat }) => {
  const [activeTab, setActiveTab] = useState("active");
  const sessions = activeTab === "active" ? activeSessions : historySessions;

  useEffect(() => {
    if (selectedChat) {
      const inCurrentTab = sessions.some((s) => s.sessionId === selectedChat.sessionId);
      if (!inCurrentTab) setSelectedChat(null);
    }
  }, [activeTab, sessions, selectedChat, setSelectedChat]);

  const handleBackgroundClick = (e) => {
    if(e.target.classList.contains("chatlist-container"));
      setSelectedChat(null);
  };

  return (
    <div className="chatlist-container" onClick={handleBackgroundClick}>
      <div className="chats">
        <div className="chatlist-heading">
          <p
            className={`${activeTab === "active" ? "selected" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("active");
            }}
          >
            Active Chats <span>({activeSessions.length})</span>
          </p>
          <p
            className={`${activeTab === "history" ? "selected" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("history");
            }}
          >
            History <span>({historySessions.length})</span>
          </p>
        </div>

        <div className="chatlist">
          {Array.isArray(sessions) && sessions.length === 0 ? (
            <p className="no-sessions">No {activeTab === "active" ? "active" : "closed"} sessions</p>
          ) : (
            Array.isArray(sessions) && sessions.map((s) => (
              <div
                key={s.sessionId}
                className={`individual-chat ${
                  selectedChat?.sessionId === s.sessionId ? "selected" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedChat(s);
                }}
              >
                <div className="top">
                  <p>{s.sessionId.slice(0, 8)}...</p>
                  <p>{s.status === "active" ? "🟢" : "🔴"}</p>
                </div>
                <div className="bottom">
                  {s.status === "active" ? (
                    <>
                      {" "}
                      <p>Last Message : {s.lastMessageAt ? new Date(s.lastMessageAt).toLocaleTimeString() : "-"}</p>
                    </>
                  ) : (
                    <p>Closed: {s.closedAt ? new Date(s.closedAt).toLocaleTimeString() : "-"}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
