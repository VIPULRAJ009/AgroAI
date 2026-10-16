const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
    {
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        transporter: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Transporter',
        },
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Vehicle',
        },
        pickupLocation: {
            type: String,
            required: [true, 'Please add pickup location'],
        },
        dropoffLocation: {
            type: String,
            required: [true, 'Please add dropoff location (Mandi)'],
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'completed'],
            default: 'pending',
        },
        isFarmerRead: {
            type: Boolean,
            default: false,
        },
        isTransporterRead: {
            type: Boolean,
            default: false,
        },
        date: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Booking', bookingSchema);
