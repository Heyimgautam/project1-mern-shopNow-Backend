const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name:{
    type : String,
    required : [true,"Enter your name"],
    maxLength :[30,"Word limit 30"],
    minLength :[4,"Name could not be less than 4 characters"]
  },
  email :{
    type : String,
    required : [true, "Enter your Email"],
    unique : true,
    validate : [validator.isEmail, "Please Enter a valid Email"]
  },
  password : {
    type : String,
    required : [true,"Please Enter the Password"],
    minLength : [8,"Password should have atleast 8 Characters"],
    select : false,
  },
  avatar : {
    public_id : {
        type : String,
        required : true,
    },
    url : {
        type : String,
        required : true
    }
  },
   role : {
    type : String,
    default : "user"
   },
   createdAt : {
    type : Date,
    default : Date.now,
   },
   resetPasswordToken : String,
   resetPasswordExpire : Date,

})

userSchema.methods.getJwtToken = function(){
    return jwt.sign({_id : this._id},process.env.JWT_SECRET);
};


userSchema.methods.getResetPasswordToken = function(){
 // Generate Token
 const resetToken = crypto.randomBytes(20).toString('hex');

 //Hashing and adding reset password token into user schema.
 this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

 this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

 return resetToken;
};
const User =  mongoose.model('User',userSchema);

module.exports = User;