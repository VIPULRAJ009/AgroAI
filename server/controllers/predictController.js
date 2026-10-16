const axios = require('axios');
const asyncHandler = require('express-async-handler');
const Recommendation = require('../models/Recommendation');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PDFDocument = require('pdfkit');
const fs = require('fs');
require('dotenv').config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is missing in .env file");
}
const genAI = new GoogleGenerativeAI(apiKey);

// @desc    Get crop prediction from ML Model
// @route   POST /api/predict
// @access  Private
const getPrediction = asyncHandler(async (req, res) => {
    const { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall, fieldName } = req.body;

    if (!fieldName) {
        res.status(400);
        throw new Error('Please provide a field name');
    }

    try {
        // Call the Python/Flask ML Model
        const response = await axios.post(process.env.CROP_PREDICTION_API_URL, {
            N: nitrogen,
            P: phosphorus,
            K: potassium,
            temperature,
            humidity,
            ph,
            rainfall
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const predictedCrop = response.data.prediction;

        // Save result to MongoDB
        const recommendation = await Recommendation.create({
            user: req.user.id,
            fieldName,
            nitrogen,
            phosphorus,
            potassium,
            temperature,
            humidity,
            ph,
            rainfall,
            predictedCrop
        });

        res.json(recommendation);
    } catch (error) {
        console.error('ML API Error:', error.message);
        res.status(500);
        throw new Error('Failed to fetch prediction from ML model');
    }
});

// @desc    Get user's recommendation history
// @route   GET /api/predict/history
// @access  Private
const getHistory = asyncHandler(async (req, res) => {
    // This returns an ARRAY of documents
    const recommendations = await Recommendation.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(recommendations);
});

// @desc    Generate AI Report using Gemini
// @route   POST /api/predict/report
// @access  Private
const generateReport = asyncHandler(async (req, res) => {
    const { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall, predictedCrop, fieldName } = req.body;

    // VALIDATION: Ensure we have the data before calling AI
    if (!predictedCrop) {
        res.status(400);
        throw new Error('No crop provided. Please predict a crop first.');
    }

    const prompt = `
      Act as an expert agronomist. I have the following soil analysis data:
      - Field Name: ${fieldName}
      - Nitrogen (N): ${nitrogen}
      - Phosphorus (P): ${phosphorus}
      - Potassium (K): ${potassium}
      - Temperature: ${temperature}°C
      - Humidity: ${humidity}%
      - pH Level: ${ph}
      - Rainfall: ${rainfall} mm

      The machine learning model predicted this crop: "${predictedCrop}".

      Please generate a short, easy-to-read soil health report for the farmer.
      1. Explain briefly why this soil is good for ${predictedCrop}.
      2. Warn if any nutrient (N, P, K) or pH is too high/low.
      3. Suggest one organic fertilizer or action they should take.
      Keep it under 150 words.
    `;

    try {
        // Use 'gemini-2.0-flash' (Fast & Reliable for free tier)
      const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

const result = await model.generateContent(prompt);

const reportText = result.response.text();

res.json({ report: reportText });

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500);
        throw new Error('AI Report Generation Failed');
    }
});

// @desc    Save recommendation manually (if needed)
// @route   POST /api/predict/save
// @access  Private
const saveRecommendation = asyncHandler(async (req, res) => {
    const { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall, fieldName, predictedCrop } = req.body;

    if (!fieldName) {
        res.status(400);
        throw new Error('Please provide a field name');
    }

    const recommendation = await Recommendation.create({
        user: req.user.id,
        fieldName,
        nitrogen,
        phosphorus,
        potassium,
        temperature,
        humidity,
        ph,
        rainfall,
        predictedCrop
    });

    res.status(201).json(recommendation);
});

// @desc    Download PDF Report
// @route   POST /api/predict/download-report
// @access  Private
const downloadReport = asyncHandler(async (req, res) => {
    const { cropName, soilData, aiReport } = req.body;

    const doc = new PDFDocument();

    const filename = `Soil_Report_${cropName}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Soil Health & Crop Recommendation', { align: 'center' });
    doc.moveDown();

    // Section 1: Recommended Crop
    doc.fontSize(16).fillColor('green').text(`Recommended Crop: ${cropName}`);
    doc.moveDown(0.5);

    // Section 2: Soil Analysis Data
    doc.fontSize(12).fillColor('black').text('Soil Composition Analysis:', { underline: true });
    doc.fontSize(10);
    // Use optional chaining just in case soilData is missing keys
    doc.text(`• Nitrogen (N): ${soilData?.N}`);
    doc.text(`• Phosphorus (P): ${soilData?.P}`);
    doc.text(`• Potassium (K): ${soilData?.K}`);
    doc.text(`• pH Level: ${soilData?.ph}`);
    doc.text(`• Humidity: ${soilData?.humidity}%`);
    doc.text(`• Temperature: ${soilData?.temperature}°C`);
    doc.text(`• Rainfall: ${soilData?.rainfall} mm`);
    doc.moveDown();

    // Section 3: AI Agronomist Report
    doc.fontSize(12).text('Expert Agronomist Analysis:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(aiReport || 'No AI report generated.', {
        align: 'justify',
        columns: 1
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).fillColor('grey').text('Generated by MERN Soil AI System', { align: 'center' });

    doc.end();
});

// Helper to generate PDF Buffer
const generatePDFBuffer = (cropName, soilData, aiReport) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Title
        doc.fontSize(20).text('Soil Health & Crop Recommendation', { align: 'center' });
        doc.moveDown();

        // Section 1: Recommended Crop
        doc.fontSize(16).fillColor('green').text(`Recommended Crop: ${cropName}`);
        doc.moveDown(0.5);

        // Section 2: Soil Analysis Data
        doc.fontSize(12).fillColor('black').text('Soil Composition Analysis:', { underline: true });
        doc.fontSize(10);
        doc.text(`• Nitrogen (N): ${soilData?.nitrogen || soilData?.N}`);
        doc.text(`• Phosphorus (P): ${soilData?.phosphorus || soilData?.P}`);
        doc.text(`• Potassium (K): ${soilData?.potassium || soilData?.K}`);
        doc.text(`• pH Level: ${soilData?.ph}`);
        doc.text(`• Humidity: ${soilData?.humidity}%`);
        doc.text(`• Temperature: ${soilData?.temperature}°C`);
        doc.text(`• Rainfall: ${soilData?.rainfall} mm`);
        doc.moveDown();

        // Section 3: AI Agronomist Report
        doc.fontSize(12).text('Expert Agronomist Analysis:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).text(aiReport || 'No AI report generated.', {
            align: 'justify',
            columns: 1
        });

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).fillColor('grey').text('Generated by MERN Soil AI System', { align: 'center' });

        doc.end();
    });
};


// @desc    Email PDF Report
// @route   POST /api/predict/email-report
// @access  Private
const emailReport = asyncHandler(async (req, res) => {
    const { cropName, soilData, aiReport } = req.body;
    const user = req.user; // From protect middleware

    if (!user || !user.email) {
        res.status(401);
        throw new Error('User email not found');
    }

    try {
        const pdfBuffer = await generatePDFBuffer(cropName, soilData, aiReport);

        const message = `
          <h1>Your Soil Analysis Report</h1>
          <p>Hello ${user.name},</p>
          <p>Please find attached the detailed soil analysis report for your field.</p>
          <p>Recommended Crop: <strong>${cropName}</strong></p>
        `;

        const sendEmail = require('../utils/sendEmail'); // Lazy load
        await sendEmail({
            email: user.email,
            subject: `Soil Report - ${cropName}`,
            html: message,
            attachments: [
                {
                    filename: `Soil_Report_${cropName}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        });

        res.status(200).json({ success: true, message: 'Report emailed successfully' });
    } catch (error) {
        console.error('Email Report Error:', error);
        res.status(500);
        throw new Error('Failed to email report');
    }
});

// @desc    Get Soil Health Summary from AI
// @route   POST /api/predict/health-summary
// @access  Private
const getHealthSummary = asyncHandler(async (req, res) => {
    const { fieldName, nitrogen, phosphorus, potassium, ph, temperature, humidity, rainfall, predictedCrop } = req.body;

    if (!predictedCrop) {
        res.status(400);
        throw new Error('No crop provided for health summary.');
    }

    const prompt = `
      Act as an expert agronomist. I have the following soil analysis data for a field named "${fieldName}":
      - Nitrogen: ${nitrogen}
      - Phosphorus: ${phosphorus}
      - Potassium: ${potassium}
      - pH Level: ${ph}
      - Temperature: ${temperature}°C
      - Humidity: ${humidity}%
      - Rainfall: ${rainfall} mm
      - Recommended Crop: ${predictedCrop}

      Based on this, provide a VERY SHORT, ONE SENTENCE summary of the soil health status (e.g., "Soil is in excellent condition for growing [Crop]" or "Soil needs more [Nutrient] for optimal [Crop] growth").
      Keep it under 20 words.
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        res.json({ summary });
    } catch (error) {
        console.error('Gemini API Error (Summary):', error);
        // Return a generic fallback if AI fails, so the dashboard doesn't break
        res.json({ summary: `Soil is ready for ${predictedCrop}.` });
    }
});

module.exports = {
    getPrediction,
    getHistory,
    generateReport,
    saveRecommendation,
    downloadReport,
    getHealthSummary,
    emailReport,
};
