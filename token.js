const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const tokenSchema = mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
   token: { type: String, required: true },
   createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});

module.exports = mongoose.model('Token', tokenSchema)
