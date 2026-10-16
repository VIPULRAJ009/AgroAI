const mongoose = require('mongoose');

const recommendationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        fieldName: {
            type: String,
            required: [true, 'Please add a field name'],
        },
        nitrogen: {
            type: Number,
            required: true,
        },
        phosphorus: {
            type: Number,
            required: true,
        },
        potassium: {
            type: Number,
            required: true,
        },
        temperature: {
            type: Number,
            required: true,
        },
        humidity: {
            type: Number,
            required: true,
        },
        ph: {
            type: Number,
            required: true,
        },
        rainfall: {
            type: Number,
            required: true,
        },
        predictedCrop: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
