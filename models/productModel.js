const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "Please enter the product name"],
        trim : true,
    },
    description : {
        type : String,
        required: [true,"Please enter the product description"]
    },
    price : {
        type : Number,
        requied : [true,"Please enter the product price"],
        maxLength : [8,"Price cannot be exceed from 8 characters"]
    },
    ratings : {
        type : Number,
        default : 0,
    },
    images : [{
        public_id : {
            type : String,
            required : true
        },
        url : {
            type : String,
            required : true
        }
    }],
    category : {
        type : String,
        required : true
    },
    stock : {
        type : Number,
        required : [true,"Please Enter the product stock"],
        maxLength : [4,"Stock cannot be exceed from 4 digits"],
    },
    numOfReviews : {
        type : Number,
        default : 0,
    },
    reviews : [
        {
          user : {
            type : mongoose.Schema.ObjectId,
            ref : "User",
            required : true,
          },
          name : {
            type : String,
            required : true
          },
          rating : {
            type : Number,
            required : true
          },
          comment:{
            type : String,
            required : true
          }
        }
    ],

    // user : {
    //     type : mongoose.Schema.ObjectId,
    //     ref : "User",
    //     required : true
    // },
    
    createdAt : {
        type : Date,
        default : Date.now,
    }
});

const Product  =  mongoose.model("Product",productSchema);

module.exports = Product;