const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: '{VALUE} is not a valid role'
    },
    default: 'user'
  },
  age: {
    type: Number,
    min: [4, 'Minimum allowed age is 4'],
    max: [120, 'Maximum allowed age is 120']
  },
  bio: {
    type: String,
    maxlength: [200, 'La biographie ne peut pas dépasser 200 caractères'],
    trim: true
  },
  phone: {
    type: String,
    match: [/^\d{8}$/, 'Numéro de 8 chiffres requis'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
