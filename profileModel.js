const mongoose = require('mongoose');

//Profile Schema Items
const customerProfileSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type :mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName: { type: String, required: true },
    createdAt: { type: String, required: true  },
    updatedAt: {type: String, required: true }
});

module.exports = mongoose.model('CustomerProfile', customerProfileSchema)
