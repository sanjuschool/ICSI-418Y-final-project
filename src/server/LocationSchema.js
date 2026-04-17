const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String },
    description: { type: String },
    createdBy: { type: String },
    coordinates: {
        long: { type: Number, required: true },
        lat: { type: Number, required: true }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Auto-update the updatedAt field when the document changes
locationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Location', locationSchema, 'Locations');