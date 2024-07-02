const express = require("express");
const {
  login,
  fetchPersons,
  logout,
  isActive,
  reverseActiveness,
  sendMessage,
  fetchChats,
} = require("../controllers/adminController");
const { authenticated } = require("../middlewares/authentication");

const router = express.Router();

router.get("/is-active", isActive);

router.post("/reverse-activeness", authenticated, reverseActiveness);

router.post("/signin", login);

router.post("/signout", logout);

router.get("/persons", authenticated, fetchPersons);

router.post("/send-message/:id", sendMessage);

router.get("/fetch-chats/:id", fetchChats);

module.exports = router;
