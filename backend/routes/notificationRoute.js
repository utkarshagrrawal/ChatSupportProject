const express = require("express");
const {
  subscribeNotification,
  getPublicKey,
} = require("../controllers/notificationController");

const router = express.Router();

router.post("/subscribe", subscribeNotification);

router.get("/key", getPublicKey);

module.exports = router;
