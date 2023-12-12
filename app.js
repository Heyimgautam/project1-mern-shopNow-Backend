const express = require('express')
const app = express();
const {config} = require('dotenv')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const productRouter = require('./routes/productRouter')
const userRouter = require('./routes/userRouter')
const errorMiddleware = require('./middleware/error')
const orderRouter = require('./routes/orderRouter')
const paymentRouter = require('./routes/paymentRouter');
const cors = require('cors');
config({
    path : "./config/.env"
})

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended : true}));
app.use(fileUpload());
app.use(cors({
    origin : [process.env.FRONTEND_URL],
    methods : ["GET","POST","PUT","DELETE"],
    credentials : true
 }))
//Routers
app.use('/api/v1/product',productRouter);
app.use('/api/v1/user',userRouter);
app.use('/api/v1/order',orderRouter);
app.use('/api/v1/payment', paymentRouter);

app.use(errorMiddleware);
module.exports = app;