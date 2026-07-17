    const mongoose = require('mongoose');

    const watchlistSchema = new mongoose.Schema({

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        tmdbId: {
            type: Number,
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

        status: {
            type: String,
            enum: [
                'Plan to Watch',
                'Watching',
                'Completed',
                'On hold',
                'Dropped'
            ],
            default: 'plan_to_watch'
        },

        addedAt: {
            type: Date,
            default: Date.now
        }

    });

     watchlistSchema.index(
            { userId: 1, tmdbId: 1 },
            { unique: true }
        );

module.exports = mongoose.model('Watchlist', watchlistSchema);