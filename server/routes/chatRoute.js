const express = require("express");
const { getSessions, getMessages, createNewSession, healthCheck } = require("../controllers/chatController");

const router = express.Router();

router.get('/', getSessions);
router.get('/:sessionId/messages', getMessages);
router.post('/', createNewSession);
router.get('/health', healthCheck);

module.exports = router;