const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const initSocket = require("./socket/session.js");
const router = require("./routes/chatRoute.js");

dotenv.config();

const app = express();
const server = http.createServer(app);
initSocket(server);

const DB_URL = process.env.MONGODB_URL;
const CLIENT_SENDER = process.env.SENDER_URL;
const CLIENT_RECEIVER = process.env.RECEIVER_URL;


app.use(cors({
    origin: [CLIENT_SENDER, CLIENT_RECEIVER],
    credentials: true
}))
app.use(express.json());

app.use('/api/sessions', router);

mongoose.connect(DB_URL)
.then(() => console.log("MongoDB connected successfully✅"))
.catch((err) => console.error("MongoDB connection failed❌", err));

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`🚀Server is running successfully in http://localhost:${PORT}`);
});