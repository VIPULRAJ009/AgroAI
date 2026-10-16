const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const Transporter = require('../models/Transporter');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, city, state, role } = req.body;

    if (!name || !email || !password || !city || !state) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const targetRole = role || 'farmer';

    if (targetRole === 'transporter') {
        const transporterExists = await Transporter.findOne({ email });
        if (transporterExists) {
            res.status(400);
            throw new Error('Transporter already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const transporter = await Transporter.create({
            name,
            email,
            password: hashedPassword,
            city,
            state,
            phone: req.body.phone,
            role: 'transporter',
        });

        if (transporter) {
            res.status(201).json({
                _id: transporter.id,
                name: transporter.name,
                email: transporter.email,
                city: transporter.city,
                state: transporter.state,
                phone: transporter.phone,
                role: transporter.role,
                image: transporter.image,
                token: generateToken(transporter._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid transporter data');
        }
    } else {
        // Farmer registration
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            city,
            state,
            phone: req.body.phone,
            role: 'farmer',
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                city: user.city,
                state: user.state,
                phone: user.phone,
                role: user.role,
                image: user.image,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    // Use default 'farmer' if role is not provided for backward compatibility, 
    // or arguably we could require it. User asked for specific error if checking wrong DB.
    const targetRole = role || 'farmer';

    if (targetRole === 'transporter') {
        const transporter = await Transporter.findOne({ email });

        if (!transporter) {
            res.status(400);
            throw new Error('Transporter not found');
        }

        if (transporter && (await bcrypt.compare(password, transporter.password))) {
            res.json({
                _id: transporter._id,
                name: transporter.name,
                email: transporter.email,
                city: transporter.city,
                state: transporter.state,
                phone: transporter.phone,
                role: transporter.role,
                image: transporter.image,
                token: generateToken(transporter._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid credentials');
        }
    } else {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(400);
            throw new Error('Farmer not found');
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                city: user.city,
                state: user.state,
                phone: user.phone,
                role: user.role,
                image: user.image,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid credentials');
        }
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    console.log('Update Profile Request Headers Content-Type:', req.headers['content-type']);
    console.log('Update Profile Request Body:', req.body);
    console.log('Update Profile Request File:', req.file);
    const user = await User.findById(req.user._id);

    if (user) {
        if (req.body.name !== undefined) {
            user.name = req.body.name;
        }

        if (req.body.email !== undefined) {
            const emailExists = await User.findOne({
                email: req.body.email,
                _id: { $ne: user._id }
            });

            if (emailExists) {
                res.status(400);
                throw new Error('Email already in use');
            }
            user.email = req.body.email;
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        if (req.file) {
            user.image = req.file.path; // Cloudinary returns the URL in path
        } else if (req.body.imageUrl) {
            user.image = req.body.imageUrl;
        } else if (req.body.image && req.body.image !== user.image) {
            user.image = req.body.image;
        }

        if (req.body.city !== undefined) {
            user.city = req.body.city;
        }

        if (req.body.state !== undefined) {
            user.state = req.body.state;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            city: updatedUser.city,
            state: updatedUser.state,
            image: updatedUser.image,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Delete user account
// @route   DELETE /api/auth/profile
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and save to DB
    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expiration (e.g., 10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Create reset URL
    // Use CLIENT_URL from env or fallback to localhost:8080 (based on your logs)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:8080';
    const resetUrl = `${clientUrl}/passwordreset/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            html: message,
        });

        res.status(200).json({ success: true, data: 'Email Sent' });
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(500);
        throw new Error('Email could not be sent');
    }
});

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid Token');
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
        success: true,
        data: 'Password reset success',
        token: generateToken(user._id),
    });
});

module.exports = {
    registerUser,
    loginUser,
    updateUserProfile,
    deleteUser,
    forgotPassword,
    resetPassword,
};