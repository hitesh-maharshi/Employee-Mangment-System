import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'employee'],
      default: 'employee',
    },
    refreshToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false
  }
);

// Middleware to hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify passwords
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate JWT Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET || 'default_access_secret_key',
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY ,
    }
    
  );
};

// Method to generate JWT Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret_key',
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY ,
    }
  );
};

export const User = mongoose.model('User', userSchema);

