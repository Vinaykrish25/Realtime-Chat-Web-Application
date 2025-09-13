const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    closedAt: {
        type: Date,
        default: null
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);