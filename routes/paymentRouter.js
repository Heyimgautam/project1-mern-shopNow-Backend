const express = require('express');
const { processPayment, sendStripeApiKey } = require('../controllers/paymentController');
const router = express.Router();
const {authentication} =require('../middleware/authority');

router.post("/process",authentication,processPayment);

router.get("/stripeapikey",sendStripeApiKey)

module.exports = router;