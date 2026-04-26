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

    status: {
        type: String,
        enum: ["pending", "approved", "declined"], // ✅ ENUMS
        default: "pending" // ✅ default for new submissions
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt
// Auto-update updatedAt
locationSchema.pre('save', function() {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Location', locationSchema, 'Locations');