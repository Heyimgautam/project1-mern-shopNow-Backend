const app = require('./app.js')
const connectDatabase = require('./config/database')
const cloudinary = require('cloudinary')


//Handling Uncaught Exceptions
process.on('uncaughtExceptions',(err)=>{
    console.log(`Error : ${err.message}`);
    console.log(`Shutting down the server due to uncaught Exceptions`);
    process.exit(1);
})

connectDatabase();

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
});

app.get('/',(req,res)=>{
    res.send("Hello there ! Nice to see you again ");
})


const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
})

//unhandled Promise Rejection

process.on("unhandledRejection",(err)=>{
    console.log(`Error : ${err.message}`);
    console.log(`Shutting down the server due to unhandled promise Rejections`);

    server.close(()=>{
        process.exit(1);
    });
});