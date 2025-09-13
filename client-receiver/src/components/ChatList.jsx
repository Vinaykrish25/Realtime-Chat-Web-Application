import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

const ChatList = ({ selectedChat, setSelectedChat }) => {
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState("active");
  const [activeSessions, setActiveSessions] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);

  const handleBackgroundClick = (e) => {
    if(e.target.classList.contains("chatlist-container"));
      setSelectedChat(null);
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("admin-joined", ({ activeSessions, historySessions }) => {
      setActiveSessions(activeSessions);
      setHistorySessions(historySessions);
    });

    socket.on("session-updated", (session) => {
      setActiveSessions((prev) =>
        prev.map((s) =>
          s.sessionId === session.sessionId ? { ...s, ...session } : s
        )
      );
    });

    socket.on("session-closed", ({ sessionId }) => {
      setActiveSessions((prev) =>
        prev.filter((s) => s.sessionId !== sessionId)
      );
      setHistorySessions((prev) => [
        ...prev,
        { sessionId, status: "closed", closedAt: new Date() },
      ]);
    });

    return () => {
      socket.off("admin-joined");
      socket.off("session-updated");
      socket.off("session-closed");
    };
  }, [socket]);

  const handleCloseSession = (sessionId) => {
    socket.emit("close-session", sessionId);
  };

  const sessions = activeTab === "active" ? activeSessions : historySessions;

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
          {sessions.length === 0 ? (
            <p className="no-sessions">No {activeTab} sessions</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.sessionId}
                className={`individual-chat ${
                  selectedChat?.sessionId === s.sessionId ? "selected" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedChat(s);
                  socket.emit("admin-join-session", s.sessionId);
                }}
              >
                <div className="top">
                  <p>{s.sessionId.slice(0, 8)}...</p>
                  <p>{s.status === "active" ? "🟢" : "🔴"}</p>
                </div>
                <div className="bottom">
                  <p>
                    {s.status === "active"
                      ? `Last Message: ${
                          s.lastMessageAt
                            ? new Date(s.lastMessageAt).toLocaleTimeString()
                            : "-"
                        }`
                      : `Closed: ${
                          s.closedAt
                            ? new Date(s.closedAt).toLocaleTimeString()
                            : "-"
                        }`}
                  </p>
                  {s.status === "active" && (
                    <button onClick={() => handleCloseSession(s.sessionId)}>
                      Close
                    </button>
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
