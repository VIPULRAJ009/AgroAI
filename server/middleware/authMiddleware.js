const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Transporter = require('../models/Transporter');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // console.log('Token found:', req.headers.authorization);
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded ID:", decoded.id);

            // Get user from the token (Check both collections)
            let user = await User.findById(decoded.id).select('-password');
            if (user) console.log("Found in Request User collection");

            if (!user) {
                user = await Transporter.findById(decoded.id).select('-password');
                if (user) console.log("Found in Transporter collection");
            }

            req.user = user;

            if (!req.user) {
                console.log("User found in neither collection");
                res.status(401);
                throw new Error('Not authorized: User not found');
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(401);
            throw new Error('Not authorized: ' + error.message);
        }
    }

    if (!token) {
        console.log('No token found in headers:', req.headers);
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = { protect };
