const resolveAsyncError = require('../middleware/resolveAsyncError');
const stripe = require("stripe")("sk_test_51OHNnhSAK1fFxVlGm6Mvg5Es6h9fMeCPc2DG6XQWHddT3KrnA2vd2TB1ssyOiwyCWKTktll1Aku7F5MFjccGFAuR00AXX2FthS");

const processPayment = resolveAsyncError(async(req,res,next)=>{
    const myPayment = await stripe.paymentIntents.create({
        amount : req.body.amount,
        currency : "inr",
        statement_descriptor_suffix : "Payment using stripe",
        automatic_payment_methods : {
            enabled : true
        }
    });

    res.status(200).json({
        success : true,
        client_secret: myPayment.client_secret
    });
});

const sendStripeApiKey = resolveAsyncError(async(req,res,next)=>{
    res.status(200).json({
        stripeApiKey : process.env.STRIPE_API_KEY
    });
});

module.exports = {
    processPayment,
    sendStripeApiKey,
}