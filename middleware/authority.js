const jwt = require('jsonwebtoken');
const resolveAsyncError = require('./resolveAsyncError');
const ErrorHandler = require('../utils/Error');
const User = require('../models/userModel');

const authentication = resolveAsyncError(async(req,res,next)=>{
  const {token} = req.cookies;
  if(!token) return next(new ErrorHandler("Login First",400));

  const decodedData = jwt.verify(token,process.env.JWT_SECRET);
  req.user = await User.findById(decodedData._id);
  next();
})

const authoriseRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorHandler(
            `Role: ${req.user.role} is not allowed to access this resouce `,
            403
          )
        );
      }
  
      next();
    };
  };


module.exports = {
    authentication,
    authoriseRoles
}