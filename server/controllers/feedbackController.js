const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');

// @desc    Send Feedback
// @route   POST /api/feedback
// @access  Public
const sendFeedback = asyncHandler(async (req, res) => {
    const { name, email, subject, message, rating } = req.body;

    if (!name || !email || !subject || !message) {
        res.status(400);
        throw new Error('Please fill in all fields');
    }

    const emailContent = `
      <h1>New Feedback Received</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Rating:</strong> ${rating} / 5</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    try {
        // Send to Admin (or the configured email user)
        await sendEmail({
            email: process.env.EMAIL_USER, // Send to self/admin
            subject: `Feedback from ${name}: ${subject}`,
            html: emailContent,
        });

        res.status(200).json({ success: true, data: 'Feedback Sent' });
    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error('Feedback could not be sent');
    }
});

module.exports = {
    sendFeedback,
};
