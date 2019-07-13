const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = mongoose.Schema({
	username: { type: String, index:true, required: true, unique: true },
	email: { type: String, required: true, unique: true, match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ },
	//email_verified_at: { type: String, default: null, required: false },,
	isVerified: {type: Boolean, default: false},
	//implemented password check using regex match: /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/
	password: { type: String, required: true },
	passwordResetToken: String,
 	passwordResetExpires: Date,
	profile: [{ type :mongoose.Schema.Types.ObjectId, ref: 'CustomerProfile'}],
});

userSchema.set('timestamps', true);

module.exports = mongoose.model('User', userSchema)
