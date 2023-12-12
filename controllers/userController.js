const User = require('../models/userModel');
const resolveAsyncError = require('../middleware/resolveAsyncError');
const ErrorHandler = require('../utils/Error')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const cloudinary = require('cloudinary')
const sendToken = require('../utils/sendToken')
const sendEmail = require('../utils/sendEmail')
//Add User
const createUser = resolveAsyncError(async(req,res,next)=>{
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder : "ShopNow.com",
        width : 150,
        crop : "scale",
    });

    const {email,password,name} = req.body;
    //let user = await User.findOne({email});
    //if(user) return next(new ErrorHandler("This Email address is already exists. Email address should be Unique",400));
     const hashedPassword = await bcrypt.hash(password,10);
   let user = await User.create({name, email, password : hashedPassword,
     avatar : {
    public_id : myCloud.public_id,
    url : myCloud.secure_url,
    }
     });
    
    sendToken(user,201,res);
    // const token =  jwt.sign({_id : user._id},process.env.JWT_SECRET);
    // res.status(200).cookie('token',token,{
    //     httpOnly : true,
    //     maxAge : 10*60*1000
    // }).json({
    //     success : true,
    //     user,
    //     token
    // })    
})

//Login User
const userLogin = resolveAsyncError(async(req,res,next)=>{
   const {email,password} = req.body;
    let user = await User.findOne({email}).select('+password');

    if(!user) return next(new ErrorHandler('Invaild email and password',400));
    
    const isMatched = await bcrypt.compare(req.body.password,user.password);
    if(!isMatched) return next(new ErrorHandler('Invalid Email and Password',400));
   // const token = jwt.sign({_id : user._id},process.env.JWT_SECRET);
    sendToken(user,201,res);
    // res.status(200).cookie('token',token,{
    //     httpOnly : true,
    //     maxAge : 10*60*1000
    // }).json({
    //     message : true,
    //     user,
    //     token
    // })
})


//Forgot password
const forgotPassword = resolveAsyncError(async(req,res,next)=>{
  const {email} = req.body;
  const user = await User.findOne({email});
  if(!user) return next(new ErrorHandler("User is not Found",404));
  
  //get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({validateBeforeSave : false});
  
  const resetPasswordUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;
// const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Your one time password Url is :- \n\n\n${resetPasswordUrl} \n\n\n If you have not intend to change password pleasr ignore it.`
  
  try{
    await sendEmail({
        email : user.email,
        subject : `Shop Now Ecommerce app Password recovery`,
        message
    })
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  }catch(error){
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({validateBeforeSave : false});
    return next(new ErrorHandler(error.message,500));
  }
})

// Reset Password
const resetPassword = resolveAsyncError(async(req,res,next)=>{
//creating token Hash
const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire : {$gt: Date.now()},
})

if(!user) return next(new ErrorHandler('Generated token is invalid or expired',400));
if(req.body.password !== req.body.confirmPassword){
    return next(new ErrorHandler('Password does not match. please Re-enter carefully',400));
}

const hashedPassword = await bcrypt.hash(req.body.password,10);
user.password = hashedPassword;
user.resetPasswordToken = undefined;
user.restPasswordExpire = undefined;

await user.save();

res.status(200).json({
  success : true,
})
//sendToken(user,201,res);
})

//Update User Password
const updatePassword = resolveAsyncError(async(req,res,next)=>{
  const user = await User.findById(req.user.id).select("+password");
  //const isMatched = bcrypt.compare(password,user.password);
  const isPasswordMatched = await bcrypt.compare(req.body.oldPassword,user.password);

  if(!isPasswordMatched) return next(new ErrorHandler("Old Password is incorrect", 400));

  if(req.body.newPassword !== req.body.confirmPassword){
    return next(new ErrorHandler("Password does not Match", 400));
  } 

  const newhashedPassword = await bcrypt.hash(req.body.newPassword,10);
  user.password = newhashedPassword;

  await user.save();
  
 // sendToken(user, 201, res);
  res.status(200).json({
    success : true,
  })
})

//get user detail
const getUserDetails = resolveAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);
  
    res.status(200).json({
      success: true,
      user,
    });
  });

  // update User Role -- Admin
 const updateUserRole = resolveAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//Delete User admin
const deleteUser = resolveAsyncError(async(req,res,next)=>{
    const id = req.params.id;
    const user = await User.findById(id);
    if(!user) return next(new ErrorHandler("User does not exist",400));
    await User.deleteOne(user);
    res.status(200).json({
        success : true,
        message : "The user has been deleted successfully"
    })
})

//Update User Profile(Edit User Personal)
const updateProfile = resolveAsyncError(async(req,res,next)=>{
  const newUserData = {
    name : req.body.name,
    email : req.body.email,
  };

  if(req.body.avatar !== ""){
    const user = await User.findById(req.user.id);
    const imageId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder : "ShopNow.com",
      width : 150,
      crop : "scale",
    });

    newUserData.avatar = {
      public_id : myCloud.public_id,
      url : myCloud.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new : true,
    runValidators : true,
    userFindAndModify : false,
  });

  res.status(200).json({
    success : true,
  })
})


//User Update admin
const updateUser = resolveAsyncError(async(req,res,next)=>{
      const id = req.params.id;
      let user = await User.findById(id);
      if(!user) return next(new ErrorHandler("User does not exist",400));
      user = await User.findByIdAndUpdate(id,req.body,{
        new : true,
        runValidators : true,
        useFindAndModify : false
      });
      res.status(200).json({
        message : true,
        user
      })
})

//All user admin
const getAllUser = resolveAsyncError(async(req,res,next)=>{
    const users = await User.find();
    res.status(200).json({
        success : true,
        users
    })
})
//single user -- admin
const particularUser = resolveAsyncError(async(req,res,next)=>{
    const id = req.params.id;
    const user = await User.findById(id);
    if(!user) return next(new ErrorHandler('User does not exist',404));

    res.status(200).json({
        success : true,
        user
    })
})

//logout 
const logoutUser = resolveAsyncError(async(req,res,next)=>{
    res.status(200).cookie("token","",{
        expires : new Date(Date.now())
    }).json({
        success : true,
        message : "Logged out successfully"
    })
})


module.exports = {
    createUser,
    userLogin,
    forgotPassword,
    resetPassword,
    deleteUser,
    updateUser,
    logoutUser,
    getAllUser,
    particularUser,
    getUserDetails,
    updateProfile,
    updatePassword,
    updateUserRole
}