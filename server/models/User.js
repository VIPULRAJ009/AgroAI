const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        phone: {
            type: String,
            required: [true, 'Please add a phone number'],
        },
        role: {
            type: String,
            enum: ['farmer', 'transporter'],
            default: 'farmer',
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        image: {
            type: String,
            default: "",
        },
        city: {
            type: String,
            required: [true, 'Please add a city'],
        },
        state: {
            type: String,
            required: [true, 'Please add a state'],
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
