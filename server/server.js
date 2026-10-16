const express = require('express'); // Restart trigger

const dotenv = require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(cors({
  origin: "https://agroai-1-8jho.onrender.com", // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  credentials: true // If your frontend sends cookies/auth headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const path = require('path');
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/predict', require('./routes/predictRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(require('./middleware/errorMiddleware').errorHandler);

if (require.main === module) {
    app.listen(port, () => console.log(`Server started on port ${port}`));
}

module.exports = app;


