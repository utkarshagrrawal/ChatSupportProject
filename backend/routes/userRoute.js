const express = require("express");
const {
  startChat,
  fetchChats,
  sendMessage,
  endChat,
} = require("../controllers/userController");

const router = express.Router();

router.post("/start-chat", startChat);

router.get("/fetch-chats/:id", fetchChats);

router.post("/send-message/:id", sendMessage);

router.put("/end-chat", endChat);

module.exports = router;
