import React, { useEffect, useState } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import { useSocket } from "../context/SocketContext";
import { v4 as uuidv4 } from "uuid";

const CustomerPage = () => {
  const { socket } = useSocket();
  const [sessionId, setSessionId] = useState(null);
  const [activeSessions, setActiveSessions] = useState(() => {
    const saved = localStorage.getItem("activeSessions");
    if (!saved) return [];
    try {
      return JSON.parse(saved).map((s) => ({
        ...s,
        createdAt: s.createdAt ? new Date(s.createdAt) : null,
        closedAt: s.closedAt ? new Date(s.closedAt) : null,
        lastMessageAt: s.lastMessageAt ? new Date(s.lastMessageAt) : null,
      }));
    } catch {
      return [];
    }
  });
  const [historySessions, setHistorySessions] = useState(() => {
    const saved = localStorage.getItem("historySessions");
    if (!saved) return [];
    try {
      return JSON.parse(saved).map((s) => ({
        ...s,
        createdAt: s.createdAt ? new Date(s.createdAt) : null,
        closedAt: s.closedAt ? new Date(s.closedAt) : null,
        lastMessageAt: s.lastMessageAt ? new Date(s.lastMessageAt) : null,
      }));
    } catch {
      return [];
    }
  });
  const [selectedChat, setSelectedChat] = useState(() => {
    const saved = localStorage.getItem("selectedChat");
    if (!saved) return null;
    let parsed;
    try {
      parsed = JSON.parse(saved);
    } catch {
      return null;
    }
    if (!parsed) return null;
    return {
      ...parsed,
      createdAt: parsed.createdAt ? new Date(parsed.createdAt) : null,
      closedAt: parsed.closedAt ? new Date(parsed.closedAt) : null,
    };
  });

  useEffect(() => {
    localStorage.setItem("activeSessions", JSON.stringify(activeSessions));
  }, [activeSessions]);
  useEffect(() => {
    localStorage.setItem("historySessions", JSON.stringify(historySessions));
  }, [historySessions]);
  useEffect(() => {
    localStorage.setItem("selectedChat", JSON.stringify(selectedChat));
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;

    const handleSessions = ({ activeSessions, historySessions }) => {
      setActiveSessions(activeSessions || []);
      setHistorySessions(historySessions || []);
    };

    const handleSessionJoined = ({ sessionId, messages, createdAt }) => {
      const session = {
        sessionId,
        status: "active",
        createdAt: createdAt || new Date(),
        messages: messages || [],
      };
      setSessionId(sessionId);
      setActiveSessions((prev) => [...prev, session]);
      setSelectedChat(session);
    };
    const handleNewMessage = (message) => {
      setActiveSessions((prev) =>
        prev.map((s) =>
          s.sessionId === message.sessionId
            ? {
                ...s,
                messages: [...(s.messages || []), message],
                lastMessageAt: message.timestamp,
              }
            : s
        )
      );
      setSelectedChat((prev) =>
        prev && prev.sessionId === message.sessionId
          ? {
              ...prev,
              messages: [...(prev.messages || []), message],
              lastMessageAt: message.timestamp,
            }
          : prev
      );
    };
    const handleSessionClosed = ({ sessionId, closedAt }) => {
      setHistorySessions((prev) => [
        ...prev,
        {
          sessionId,
          status: "closed",
          closedAt: closedAt || new Date(),
          messages: [],
        },
      ]);
      setActiveSessions((prev) =>
        prev.filter((s) => s.sessionId !== sessionId)
      );
      setSelectedChat((prev) =>
        prev && prev.sessionId === sessionId
          ? { ...prev, status: "closed", closedAt: closedAt || new Date() }
          : prev
      );
      setSessionId(sessionId);
    };

    socket.on('sessions-refresh', handleSessions);
    socket.on("session-joined", handleSessionJoined);
    socket.on("new-message", handleNewMessage);
    socket.on("session-closed", handleSessionClosed);
    return () => {
      socket.off('sessions-refresh', handleSessions);
      socket.off("session-joined", handleSessionJoined);
      socket.off("new-message", handleNewMessage);
      socket.off("session-closed", handleSessionClosed);
    };
  }, [socket]);

  const startNewChat = () => {
    if (!socket) return;
    const newSessionId = uuidv4();
    socket.emit("join-session", newSessionId);
  };

  const sendMessage = (data) => {
    if (!socket || !sessionId) return;
    socket.emit("send-message", {
      ...data,
      sessionId,
      sender: "client",
      timestamp: new Date(),
    });
  };

  const leaveSession = () => {
    setSelectedChat(null);
  };

  return (
    <div className="chatpage-container">
      <ChatList
        activeSessions={activeSessions}
        historySessions={historySessions}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />
      <ChatWindow
        onLeaveSession={leaveSession}
        onSend={sendMessage}
        onNewChat={startNewChat}
        selectedChat={selectedChat}
      />
    </div>
  );
};

export default CustomerPage;
