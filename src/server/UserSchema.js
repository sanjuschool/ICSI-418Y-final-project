const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fname: { type: String },
    lastname: { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],

    role: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema, 'Users');