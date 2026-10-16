const express = require('express');
const router = express.Router();
const { getVehicles, getMyVehicles, addVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(protect, getVehicles).post(protect, upload.single('image'), addVehicle);
router.route('/my').get(protect, getMyVehicles);
router.route('/:id').delete(protect, deleteVehicle);

module.exports = router;
