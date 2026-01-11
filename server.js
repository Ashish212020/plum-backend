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
app.use(express.json({
    origin: [
        "https://frontend-plum.onrender.com", 
        "http://localhost:5173",             
        "http://localhost:5000"             
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
}));


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
        
       
        else if (req.body) {
            console.log("Processing text/JSON input...");
            
            
            let inputData = req.body.text || req.body;

            
            if (typeof inputData === 'string') {
                inputData = inputData.trim();
                try {
                    if (inputData.startsWith("{")) {
                        inputData = JSON.parse(inputData);
                    }
                } catch (e) {
                   
                }
            }

            
            if (typeof inputData === 'object' && Object.keys(inputData).length > 0) {
                
                parsedData = {
                    age: inputData.age,
                    smoker: (inputData.smoker !== undefined) 
                        ? (inputData.smoker === true || inputData.smoker === "true") 
                        : undefined,
                    diet: inputData.diet,
                    exercise: inputData.exercise
                };
            } else if (typeof inputData === 'string' && inputData.length > 0) {
                
                parsedData = parseOCRText(inputData);
            } else {
                 return res.status(400).json({ error: "Please upload an image or provide text." });
            }
        } else {
            return res.status(400).json({ error: "Invalid input format." });
        }

       
        let missingCount = 0;

        if (!parsedData.age) missingCount++;
        if (parsedData.smoker === undefined) missingCount++; 
        if (!parsedData.diet || parsedData.diet === "unknown") missingCount++;
        if (!parsedData.exercise || parsedData.exercise === "unknown") missingCount++;

        
        console.log(`Missing Fields: ${missingCount}/4`);

       
        if (missingCount > 2) {
            return res.json({ 
                status: "incomplete_profile", 
                reason: ">50% fields missing",
                missing_count: missingCount 
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