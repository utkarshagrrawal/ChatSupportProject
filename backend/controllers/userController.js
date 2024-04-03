const { fetchChatsLogic, sendMessageLogic } = require("../logic/userLogic");
const { startChatLogic } = require("../logic/userLogic");

const startChat = async (req, res) => {
    const response = await startChatLogic(req.body);
    if (response.error) {
        return res.json({ error: response.error })
    }
    return res.json({ success: response.success, userId: response.userId })
}

const fetchChats = async (req, res) => {
    const response = await fetchChatsLogic(req.params);
    if (response.error) {
        return res.json({ error: response.error })
    }
    return res.json({ success: response.success })
}

const sendMessage = async (req, res) => {
    const response = await sendMessageLogic(req.body, req.params);
    if (response.error) {
        return res.json({ error: response.error })
    }
    return res.json({ success: response.success })
}

module.exports = {
    startChat,
    fetchChats,
    sendMessage
}