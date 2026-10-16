const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, updateBookingStatus, markNotificationRead } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createBooking);
router.route('/my').get(protect, getMyBookings);
router.route('/:id/status').put(protect, updateBookingStatus);
router.route('/:id/read').put(protect, markNotificationRead);

module.exports = router;
