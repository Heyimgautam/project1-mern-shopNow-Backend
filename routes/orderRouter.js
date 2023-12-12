const express = require('express');
const router = express.Router();
const {authentication,authoriseRoles} = require('../middleware/authority')
const {newOrder,particularOrder,myOrders,getAllOrders,updateOrder,deleteOrder} = require('../controllers/orderController');

router.post('/new',authentication,newOrder);
router.get('/:id',authentication,particularOrder);
router.get('/me/:id',authentication,myOrders);
router.get('/admin/AllOrders',authentication,authoriseRoles('admin'),getAllOrders);
router.route('/admin/OrderStatus/:id').put(authentication,authoriseRoles('admin'),updateOrder).delete(authentication,authoriseRoles('admin'),deleteOrder);

module.exports = router;