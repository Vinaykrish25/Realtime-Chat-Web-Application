const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    text: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        enum: ['client', 'admin'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isRichText: {
        type: Boolean,
        default: false
    },
    richTextContent: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
});

module.exports = mongoose.model("Message", messageSchema);