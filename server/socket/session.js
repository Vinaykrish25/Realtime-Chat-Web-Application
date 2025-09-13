const socketIo = require("socket.io");
const Chatsession = require("../models/ChatSession.js");
const Message = require("../models/Message.js");
const ChatSession = require("../models/ChatSession.js");

function initSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const activeConnections = new Map();
  const adminConnections = new Set();

  io.on("connection", (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    socket.on("join-session", async (sessionId) => {
      try {
        socket.join(sessionId);
        activeConnections.set(socket.id, { sessionId, type: "client" });
        let session = await Chatsession.findOne({ sessionId });
        if (!session) {
          session = new Chatsession({ sessionId });
          await session.save();
        }
        const messages = await Message.find({ sessionId })
          .sort({ timestamp: 1 })
          .limit(100);
        socket.emit("session-joined", { sessionId, messages, createdAt: session.createdAt, status: session.status, closedAt: session.closedAt, lastMessageAt: session.lastMessageAt, });
        socket.to("admin-room").emit("session-updated", {
          sessionId,
          status: "active",
          lastMessageAt: session.lastMessageAt,
        });
          const activeSessions = await (await ChatSession.find({status: "active"})).sort({lastMessageAt: -1});
          const historySessions = await (await ChatSession.find({status: "closed"})).sort({closedAt: -1}).limit(50);
          io.to("admin-room").emit("sessions-refresh", {activeSessions, historySessions});

        console.log(`👤 Client joined session: ${sessionId}`);
      } catch (error) {
        console.error("Error joining session:", error);
        socket.emit("error", { message: "Failed to join session" });
      }
    });

    socket.on("join-admin", async () => {
      try {
        socket.join("admin-room");
        adminConnections.add(socket.id);
        activeConnections.set(socket.id, { type: "admin" });
        const activeSessions = await Chatsession.find({
          status: "active",
        }).sort({ lastMessageAt: -1 });
        const historySessions = await Chatsession.find({ status: "closed" })
          .sort({ closedAt: -1 })
          .limit(50);
        socket.emit("sessions-refresh", {
          activeSessions,
          historySessions,
        });
        console.log(`👨‍💼 Admin connected: ${socket.id}`);
      } catch (error) {
        console.error("Error joining admin:", error);
        socket.emit("error", { message: "Failed to join as admin" });
      }
    });

    socket.on("admin-join-session", async (sessionId) => {
      try {
        socket.join(`admin-${sessionId}`);
        const messages = await Message.find({ sessionId })
          .sort({ timestamp: 1 })
          .limit(100);
        socket.emit("session-messages", { sessionId, messages });
        console.log(`👨‍💼Admin joined session: ${sessionId}`);
      } catch (error) {
        console.error("Error admin joining session:", error);
        socket.emit("error", { message: "Failed to join session as admin" });
      }
    });

    socket.on("send-message", async (data) => {
      try {
        const { sessionId, text, sender, richTextContent, isRichText } = data;
        const message = new Message({
          sessionId,
          text,
          sender,
          richTextContent: isRichText ? richTextContent : null,
          isRichText: isRichText || false,
        });
        await message.save();
        await Chatsession.findOneAndUpdate(
          { sessionId },
          { lastMessageAt: new Date() }
        );
        const messageData = {
          _id: message._id,
          sessionId: message.sessionId,
          text: message.text,
          sender: message.sender,
          timestamp: message.timestamp,
          isRichText: message.isRichText,
          richTextContent: message.richTextContent,
        };
        io.to(sessionId).emit("new-message", messageData);
        io.to(`admin-${sessionId}`).emit("new-message", messageData);
        socket.to("admin-room").emit("session-updated", {
          sessionId,
          status: "active",
          lastMessageAt: new Date(),
        });
        console.log(`💬Message sent in session ${sessionId} by ${sender}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("close-session", async (sessionId) => {
      try {
        await Chatsession.findOneAndUpdate(
          { sessionId },
          {
            status: "closed",
            closedAt: new Date(),
          }
        );
        io.to(sessionId).emit("session-closed", { sessionId });
        io.to("admin-room").emit("session-closed", { sessionId });
        console.log(`🔒 Session closed: ${sessionId}`);
      } catch (error) {
        console.error("Error closing session:", error);
        socket.emit("error", { message: "Failed to close session" });
      }
    });

    socket.on("disconnect", () => {
      const connection = activeConnections.get(socket.id);
      if (connection) {
        if (connection.type === "admin") {
          adminConnections.delete(socket.id);
        }
        activeConnections.delete(socket.id);
      }
      console.log(`🔌Disconnected: ${socket.id}`);
    });
  });
}

module.exports = initSocket;
