const mongoose = require('mongoose');
const RiskProfileSchema = new mongoose.Schema({
    answers: {
        age: Number,
        smoker: Boolean,
        diet: String,
        exercise: String
    },
    riskScore: Number,
    riskLevel: String, 
    recommendations: [String],
    factors: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RiskProfile', RiskProfileSchema);