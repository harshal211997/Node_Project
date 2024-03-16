const express = require('express');
const authController = require('./../controller/authController.js');
const userController = require('./../controller/userController.js');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//protecting all below routes
//we are protecting all below routes by call middleware
router.use(authController.protect); //if we call any of below route first it will run protect (this middleware then called route)

router.patch('/updateMyPassword', authController.updatePassword);
//getMe route:
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

//protecting all below route for admin user only
//we set one middleware whcih will run first when we call any of below route
router.use(authController.restrictTo('admin'));
//normal user route:
router.route('/').get(userController.getAllUser);
//
router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updatedUser);

module.exports = router;
