const mongoose = require('mongoose');
const validator = require('validator');
//node package for password encryptions
const bcrypt = require('bcryptjs');

//schema:
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please tell us your email'],
    unique: true,
    //transfer all char to lowercase
    lowercase: true,
    //email validator: calling isEmail method on email to check correct email format
    validate: [validator.isEmail, , 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minLength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm yor password'],
    //custome validator to check both password and passwordConfirm are same
    validate: {
      //This only works on create() and save();
      validator: function (el) {
        // el = current element = passwordConfirm
        return el === this.password;
      },
      message: 'Password are not the same',
    },
  },
});

//Password encryption: using pre save document middleware
//this will happen between a movement where we recive a data and before save it into DB
userSchema.pre('save', async function (next) {
  //only encypt password when only password field updated
  //and only on new new user password
  //every mongoose schema having isModified method which will retuen true of field modified
  if (!this.isModified('password')) {
    return;
    next();
  } else {
    //using bcryptjs package
    //return promise
    //12 is salt value to say hash algorithm how strong password encryption we want
    this.password = await bcrypt.hash(this.password, 12);
    //delte the confirmed password to save only real password in DB
    //we are not really deleting just in DB we are saving as undefined so that no ine knows orgional pass
    // ass this middleware work befor doc save so that first password is checked with passwordConfirm and then deleted before save
    this.passwordConfirm = undefined;
    next();
  }
});

//model:
const User = mongoose.model('User', userSchema);

//exporting model
module.exports = User;
