const express = require('express');
const router = express.Router();
const {createUser,userLogin,deleteUser, updateUser,updateProfile, logoutUser, getAllUser, forgotPassword,resetPassword,particularUser, getUserDetails, updatePassword, updateUserRole} = require('../controllers/userController');
const {authentication,authoriseRoles} = require('../middleware/authority');

router.post('/new',createUser);
router.post('/login',userLogin);
router.post('/password/forgot',forgotPassword);
router.put('/password/update',authentication,updatePassword);
router.put('/password/reset/:token',resetPassword);
router.route('/admin/:id').delete(authentication,authoriseRoles("admin"),deleteUser).put(authentication,authoriseRoles("admin"),updateUser);
router.get('/logout',logoutUser)
router.get('/me',authentication,getUserDetails);
router.put('/me/update',authentication,updateProfile);
router.get('/admin/select/:id',authentication,authoriseRoles("admin"),particularUser)
router.get('/admin/allUser',authentication,authoriseRoles("admin"),getAllUser)
router.put('/admin/role/:id', authentication, authoriseRoles('admin'), updateUserRole);

module.exports = router;