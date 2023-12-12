const Product = require('../models/productModel');
const mongoose = require('mongoose');
const ErrorHandler = require('../utils/Error');
const resolveAsyncError = require('../middleware/resolveAsyncError')
const ApiFeatures = require('../utils/searchingFeature')
const cloudinary = require('cloudinary');
// To add Product
const createProduct = resolveAsyncError (async(req,res,next)=>{
      let images = [];

      if(typeof req.body.images === "string"){
         images.push(req.body.images);
      }else{
        images = req.body.images;
      }

      const imagesLinks = [];

      for(let i=0; i<images.length; i++){
        const result = await cloudinary.v2.uploader.upload(images[i],{
          folder: "Products",
        });
        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      req.body.images = imagesLinks;
      req.body.user = req.body.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success : true,
        product
    })
})

// To display all the product
// const getAllProduct = resolveAsyncError(async(req,res,next)=>{
    
//     const resultPerPage = 8;
//   const productsCount = await Product.countDocuments();

//   const apiFeature = new ApiFeatures(Product.find(), req.query)
//     .search()
//     .filter();

//   let products = await apiFeature.query;

//   let filteredProductsCount = products.length;

//   apiFeature.pagination(resultPerPage);

//   products = await apiFeature.query;

//   res.status(200).json({
//     success: true,
//     products,
//     productsCount,
//     resultPerPage,
//     filteredProductsCount,
//   });
// })

//Admin : To see all product
const getAdminAllProduct = resolveAsyncError(async(req,res,next)=>{
  const products = await Product.find();
  res.status(200).json({
    message : true,
    products
  })
});

const getAllProduct = resolveAsyncError(async(req,res,next)=>{
  
  const resultPerPage = 8;
  const productsCount = await Product.countDocuments();
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  let products = await apiFeature.query;
  let filteredProductsCount = products.length;
 // const product = await Product.find();
  res.status(200).json({
    success : true,
    products,
    resultPerPage,
    productsCount,
    filteredProductsCount
  })
})
// To delete Product
const deleteProduct = resolveAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    // if(!product) return res.status(404).json({
    //     success : false,
    //     error : "Product is not found"
    // });
    if(!product) return next(new ErrorHandler("Product is not found",404));
    //Deleting Images from Cloudinary
    for(let i=0; i< product.images.length; i++){
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.deleteOne();
    res.status(200).json({
        success : true,
        message : "Product deleted successfully"
    })
})

// To update the product
const updateProduct = resolveAsyncError(async(req,res,next)=>{

  let product = await Product.findById(req.params.id);

    if(!product) return next(new ErrorHandler("Product is not found",404));
 
     // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined){
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "Products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    req.body.images = imagesLinks;
  }
    
  
  product = await Product.findByIdAndUpdate(req.params.id,req.body,{
       new : true,
       runValidators : true,
       useFindAndModify : false
  })

  res.status(200).json({
    success : true,
    product
  })  
})

//To see specific product
const productDetails = resolveAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    // if(!product) return res.status(404).json({
    //     success : false,
    //     error : "Product is not found"
    // })
     if(!product) return next(new ErrorHandler("Product is not found",404))
    res.status(200).json({
        success : true,
        product
    })
})

// Create and update Reviews
const createProductReview = resolveAsyncError(async(req,res,next)=>{
     const {rating,comment,productId} = req.body;
  const review = {
      user : req.user._id,
      name : req.user.name,
      rating : Number(rating),
      comment : req.user.comment
  };
  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev)=> rev.user.toString() === req.user._id.toString()
  );

  if(isReviewed){
    product.reviews.forEach((rev)=>{
      if(rev.user.toString() === req.user._id.toString())
      (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((rev)=>{
    avg += rev.rating;
  });

  product.ratings = avg/product.reviews.length;
  await product.save({validateBeforeSave : false});
  res.status(200).json({
    success : true,
  });
});


//All Review
// const getAllProductReview = (async (req, res, next) => {
//   const { id } = req.query;

//   try {
//     const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

//     if (!isValidObjectId) {
//       return next(new ErrorHandler("Invalid Id", 404));
//     }

//     const product = await Product.findById(mongoose.Types.ObjectId(id));

//     if (!product) {
//       return next(new ErrorHandler("Product is not found", 404));
//     }

//     res.status(200).json({
//       success: true,
//       reviews: product.reviews,
//     });
//   } catch (error) {
//     // Handle other errors, including potential cast errors
//     return next(new ErrorHandler("Internal Server Error", 500));
//   }
// });

//All reviews
const getAllProductReview = resolveAsyncError(async(req,res,next)=>{
    const productId = req.params.id;
 const product = await Product.findById(productId);
 
 if(!product) return next(new ErrorHandler("Product is not found",404));

 res.status(200).json({
   success : true,
   reviews : product.reviews,
 })
})

//DeleteReview
const deleteProductReview = resolveAsyncError(async(req,res,next)=>{
  const productId = req.params.id;
  const reviewId = req.body.reviewId;
  const product = await Product.findById(productId);

  if(!product) return next(new ErrorHandler('Product is not found',404))

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== reviewId.toString()
  );

  let avg = 0;

  reviews.forEach((rev)=>{
    avg += rev.rating;
  });

  let ratings = 0;

  if(reviews.length === 0){
    ratings = 0;
  }else {
    ratings = avg/reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(productId,{
    reviews,
    ratings,
    numOfReviews,
  },{
    new : true,
    runValidators : true,
    useFindAndModify : false,
  });

  res.status(200).json({
    success : true,
  });
});

module.exports = {
    createProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    productDetails,
    createProductReview,
    getAllProductReview,
    deleteProductReview,
    getAdminAllProduct,
}