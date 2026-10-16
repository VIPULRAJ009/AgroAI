const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Define email options
    const mailOptions = {
        from: `"AgroAI Support" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html, // Optional HTML content
        attachments: options.attachments, // Optional attachments
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
