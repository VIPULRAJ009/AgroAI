const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Transporter',
        },
        type: {
            type: String,
            required: [true, 'Please specify vehicle type (e.g., Truck, Tractor)'],
        },
        capacity: {
            type: Number,
            required: [true, 'Please specify capacity in Quintals'],
        },
        pricePerKm: {
            type: Number,
            required: [true, 'Please specify price per KM'],
        },
        driverName: {
            type: String,
            required: [true, 'Please add driver name'],
        },
        licensePlate: {
            type: String,
            required: [true, 'Please add license plate number'],
        },
        image: {
            type: String,
            default: '',
        },
        city: {
            type: String,
            required: [true, 'Please add available city'],
        },
        state: {
            type: String,
            required: [true, 'Please add available state'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
