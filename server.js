const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const Tesseract = require('tesseract.js');
require('dotenv').config();

const connectDB = require('./db');
const RiskProfile = require('./models/RiskProfile');
const { parseOCRText } = require('./utils/parser');
const { calculateRisk } = require('./utils/riskEngine');

const app = express();
app.use(cors());
app.use(express.json());


connectDB();

const upload = multer({ dest: 'uploads/' });

app.post('/api/analyze', upload.single('file'), async (req, res) => {
    try {
        let extractedText = "";
        let parsedData = {};

        if (req.file) {
            console.log("Processing image...");
            const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng');
            extractedText = text;
            fs.unlinkSync(req.file.path); 
            parsedData = parseOCRText(extractedText);
        } 
        else if (req.body.text) {
            console.log("Processing text input...");
            const input = req.body.text.trim();

            try {
                if (input.startsWith("{")) {
                    const jsonData = JSON.parse(input);
                    parsedData = {
                        age: jsonData.age,
                        smoker: (jsonData.smoker !== undefined) 
                            ? (jsonData.smoker === true || jsonData.smoker === "true") 
                            : undefined,
                        diet: jsonData.diet,
                        exercise: jsonData.exercise
                    };
                } else {
                    parsedData = parseOCRText(input);
                }
            } catch (e) {
                parsedData = parseOCRText(input);
            }
        } else {
            return res.status(400).json({ error: "Please upload an image or provide text." });
        }

        let missingCount = 0;

        if (!parsedData.age) missingCount++;
        if (parsedData.smoker === undefined) missingCount++; 
        if (!parsedData.diet || parsedData.diet === "unknown") missingCount++;
        if (!parsedData.exercise || parsedData.exercise === "unknown") missingCount++;

        if (missingCount > 2) {
            return res.json({ 
                status: "incomplete_profile", 
                reason: ">50% fields missing",
                message: "Profile Incomplete: >50% of data is missing." 
            });
        }
        const riskAnalysis = calculateRisk(parsedData);
        const newProfile = new RiskProfile({
            answers: parsedData,
            riskScore: riskAnalysis.score,
            riskLevel: riskAnalysis.riskLevel,
            factors: riskAnalysis.factors,
            recommendations: riskAnalysis.recommendations
        });
        
        await newProfile.save();
        res.json({ status: "ok", data: newProfile });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));