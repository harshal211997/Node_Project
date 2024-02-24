const crypto = require('crypto');
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
  role: {
    type: String,
    //validator
    enum: ['user', 'guid', 'lead-guid', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minLength: 8,
    //in-visible from output
    select: false,
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
  passwordChangeAt: Date,
  passwordRestToken: {
    type: String,
  },
  passwordResetExpire: {
    type: Date,
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

//instance methods: adding our own createPasswords methods to encrypt the user typed password to check it at the time of login
//we are added a correctPassword methods which will available for all user documents
userSchema.methods.correctPasswords = async function (
  candidatePassword,
  userPassword
) {
  //compare will compare two password and return true if same or else false
  return await bcrypt.compare(candidatePassword, userPassword);
};
//added new method in userSchema to to check changedPass time and JWTTimestamp
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    ); // to timeStamp
    console.log(changedTimeStamp, JWTTimestamp);
    return JWTTimestamp < changedTimeStamp; //true means pass changes
  }
  //false means not changed
  return false;
};
//adding new instance method for createPass token
userSchema.methods.createPasswordResetToken = function () {
  //will use crypto node module to create token in hex form
  const resetToken = crypto.randomBytes(32).toString('hex');
  //encrypting token
  //saving encrypted token to DB
  //here we saved encrypted (passwordRestToken) in DB by which no one can able to hack and reset password
  this.passwordRestToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, { passwordRestToken: this.passwordRestToken });
  //need to give 10min time to reset password (10 * 60 * 1000)ms
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  //return token via emai;
  return resetToken;
};
//model:
const User = mongoose.model('User', userSchema);

//exporting model
module.exports = User;
