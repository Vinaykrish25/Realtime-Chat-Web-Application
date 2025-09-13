const {v4: uuidv4} = require('uuid');
const ChatSession = require('../models/ChatSession.js');
const Message = require('../models/Message.js');

exports.getSessions = async (req, res) => {
    try {
        const {status} = req.query;
        const query = status ? {status} : {};
        const sessions = await ChatSession.find(query).sort({lastMessageAt: -1});
        res.status(200).json({
            data: sessions || [],
            count: sessions?.length || 0,
            message: sessions?.length ? "Sessions fetched successfully" : "No sessions found",
        });
    } catch (error) {
        console.error('Error in fetching session', error);
        res.status(500).json({error: error.message});
    }
};

exports.getMessages = async (req, res) => {
    try {
        const {sessionId} = req.params;
        const messages = await Message.find({sessionId}).sort({timestamp: 1});
        res.status(200).json({data: messages}); 
    } catch (error) {
        console.error('Error in fetching messages', error);
        res.status(500).json({error: error.message});
    }
};

exports.createNewSession = async (req, res) => {
    try {
        const sessionId = uuidv4();
        const session = new ChatSession({sessionId, status: 'active', lastMessageAt: new Date()});
        await session.save();
        res.status(200).json({data: sessionId});
    } catch (error) {
        console.error('Error in creating session', error);
        res.status(500).json({error: error.message});
    }
};

exports.healthCheck = async (req, res) => {
    res.json({status: 'OK', timestamp: new Date().toISOString()});
};

