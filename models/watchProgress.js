const mongoose = require('mongoose');

const watchProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tmdbId: {
        type: Number,
        required: true
    },
    mediaType: {
        type: String,
        enum: ['movie', 'tv'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    posterPath: {
        type: String,
        default: ''
    },
    progress: {
        type: Number,
        default: 0
    },
    currentTime: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 0
    },
    season: {
        type: Number,
        default: null
    },
    episode: {
        type: Number,
        default: null
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

watchProgressSchema.index({ userId: 1, tmdbId: 1, mediaType: 1 }, { unique: true });

module.exports = mongoose.model('WatchProgress', watchProgressSchema);
