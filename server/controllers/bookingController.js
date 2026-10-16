const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const sendEmail = require('../utils/sendEmail');
const Transporter = require('../models/Transporter');
const User = require('../models/User');

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private (Farmer only)
// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private (Farmer only)
const createBooking = asyncHandler(async (req, res) => {
    if (req.user.role !== 'farmer') {
        res.status(401);
    }

    const { transporterId, vehicleId, pickupLocation, dropoffLocation, date, cropType, weight, distance, totalPrice } = req.body;

    if (!transporterId || !vehicleId || !pickupLocation || !dropoffLocation || !date || !cropType || !weight || !distance || !totalPrice) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const booking = await Booking.create({
        farmer: req.user.id,
        transporter: transporterId,
        vehicle: vehicleId,
        pickupLocation,
        dropoffLocation,
        date,
        cropType,
        weight,
        distance,
        totalPrice
    });

    // Notify Transporter via Email
    const transporter = await Transporter.findById(transporterId);
    if (transporter && transporter.email) {
        const message = `
            <h1>New Transport Booking Request</h1>
            <p>You have a new booking request from <strong>${req.user.name}</strong>.</p>
            <h3>Booking Details:</h3>
            <ul>
                <li><strong>Pickup:</strong> ${pickupLocation}</li>
                <li><strong>Dropoff:</strong> ${dropoffLocation}</li>
                <li><strong>Crop:</strong> ${cropType}</li>
                <li><strong>Weight:</strong> ${weight} Quintals</li>
                <li><strong>Distance:</strong> ${distance} km</li>
                <li><strong>Total Price:</strong> ₹${totalPrice}</li>
                <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
            </ul>
            <p>Please log in to your dashboard to accept or reject this request.</p>
        `;

        try {
            await sendEmail({
                email: transporter.email,
                subject: 'New Transport Booking Request',
                html: message,
            });
        } catch (error) {
            console.error('Email send failed:', error);
        }
    }

    res.status(201).json(booking);
});

// @desc    Get user bookings (Farmer or Transporter)
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
    let bookings;

    if (req.user.role === 'transporter') {
        bookings = await Booking.find({ transporter: req.user.id })
            .populate('farmer', 'name email phone')
            .populate('vehicle', 'licensePlate type')
            .sort({ createdAt: -1 });
    } else {
        bookings = await Booking.find({ farmer: req.user.id })
            .populate('transporter', 'name email phone')
            .populate('vehicle', 'licensePlate type')
            .sort({ createdAt: -1 });
    }

    res.status(200).json(bookings);
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Transporter only)
const updateBookingStatus = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    if (req.user.id !== booking.transporter.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this booking');
    }

    const { status } = req.body;
    if (!['accepted', 'rejected', 'completed'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    booking.status = status;
    await booking.save();

    // Notify Farmer via Email
    const farmer = await User.findById(booking.farmer);
    if (farmer && farmer.email) {
        const message = `
            <h1>Booking ${status.charAt(0).toUpperCase() + status.slice(1)}</h1>
            <p>Your booking request has been <strong>${status}</strong> by ${req.user.name}.</p>
            <p><strong>Note:</strong> ${status === 'accepted' ? 'Please keep your phone active for driver contact.' : 'You can find other vehicles in the Find Transport section.'}</p>
        `;
        try {
            await sendEmail({
                email: farmer.email,
                subject: `Booking Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                html: message,
            });
        } catch (error) {
            console.error('Email send failed:', error);
        }
    }

    res.status(200).json(booking);
});





// @desc    Mark booking notification as read
// @route   PUT /api/bookings/:id/read
// @access  Private
const markNotificationRead = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Determine role and mark appropriate field
    // Note: A user could be both, but we check role from token
    if (req.user.role === 'transporter') {
        booking.isTransporterRead = true;
    } else {
        booking.isFarmerRead = true;
    }

    await booking.save();
    res.status(200).json({ success: true });
});

module.exports = {
    createBooking,
    getMyBookings,
    updateBookingStatus,
    markNotificationRead,
};
