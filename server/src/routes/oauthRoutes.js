
const express = require("express");

const {
  startGoogle,
  googleCallback,
  exchangeTicket,
} = require("../controllers/oauthController");

const router = express.Router();

router.get("/google/start", startGoogle);

router.get("/google/callback", googleCallback);

router.post("/exchange", exchangeTicket);

module.exports = router;
