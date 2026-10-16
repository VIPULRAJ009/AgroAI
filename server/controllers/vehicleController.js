const asyncHandler = require('express-async-handler');
const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles (with filters)
// @route   GET /api/vehicles
// @access  Private
const getVehicles = asyncHandler(async (req, res) => {
    const { city, state } = req.query;
    const filter = {};

    if (city) filter.city = city;
    if (state) filter.state = state;

    const vehicles = await Vehicle.find(filter).populate('user', 'name phone email'); // Include transporter details
    res.status(200).json(vehicles);
});

// @desc    Get transporter's own vehicles
// @route   GET /api/vehicles/my
// @access  Private
const getMyVehicles = asyncHandler(async (req, res) => {
    const vehicles = await Vehicle.find({ user: req.user.id });
    res.status(200).json(vehicles);
});

// @desc    Add a vehicle
// @route   POST /api/vehicles
// @access  Private (Transporter only)
const addVehicle = asyncHandler(async (req, res) => {
    if (req.user.role !== 'transporter') {
        res.status(401);
        throw new Error('Only transporters can add vehicles');
    }

    const { type, capacity, pricePerKm, driverName, licensePlate, city, state } = req.body;
    let image = req.body.image || '';

    if (req.file) {
        image = req.file.path;
    }

    if (!type || !capacity || !pricePerKm || !driverName || !licensePlate || !city || !state) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const vehicle = await Vehicle.create({
        user: req.user.id,
        type,
        capacity,
        pricePerKm,
        driverName,
        licensePlate,
        image,
        city,
        state,
    });

    res.status(201).json(vehicle);
});

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        res.status(404);
        throw new Error('Vehicle not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the vehicle user
    if (vehicle.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await vehicle.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getVehicles,
    getMyVehicles,
    addVehicle,
    deleteVehicle,
};
