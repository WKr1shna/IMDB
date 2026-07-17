
    const mongoose = require('mongoose');

    const reviewSchema = new mongoose.Schema({

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        tmdbId: {
            type: Number,
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            default: ''
        },

        createdAt: {
            type: Date,
            default: Date.now
        }

    });
    reviewSchema.index(
    { userId: 1, tmdbId: 1 },
    { unique: true }
);
 module.exports = mongoose.model('Review', reviewSchema);