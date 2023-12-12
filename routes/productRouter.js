const express = require('express');
const router = express.Router();
const {createProduct,getAllProduct,updateProduct,deleteProduct,productDetails, createProductReview, getAllProductReview, deleteProductReview, getAdminAllProduct}  = require('../controllers/productController')
const {authentication,authoriseRoles} = require('../middleware/authority')
router.post('/new',createProduct);
// router.route('/new').post(createProduct);
router.get('/AllProducts',getAllProduct);
 router.route('/admin/AllProducts').get(authentication, authoriseRoles('admin'),getAdminAllProduct);

router.route('/:id').put(authentication,authoriseRoles('admin'),updateProduct).delete(authentication,authoriseRoles('admin'),deleteProduct).get(authentication,authoriseRoles('admin'),productDetails);
router.post('/review/new',authentication,createProductReview);
// router.route('/reviews').delete(authentication,deleteProductReview);
router.route('/reviews/:id').get(getAllProductReview).delete(deleteProductReview);
module.exports = router;
