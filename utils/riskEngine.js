const calculateRisk = (data) => {
    let score = 0;
    let factors = [];
    let recommendations = [];

    
    if (data.age > 50) {
        score += 20;
        factors.push("Age > 50");
    }

    
    if (data.smoker) {
        score += 40;
        factors.push("Smoker");
        recommendations.push("Consider a smoking cessation program.");
    }

    
    if (data.diet === "high sugar") {
        score += 20;
        factors.push("High Sugar Diet");
        recommendations.push("Reduce sugar intake and eat more vegetables.");
    }

    
    if (data.exercise === "rarely") {
        score += 20;
        factors.push("Sedentary Lifestyle");
        recommendations.push("Aim for at least 30 minutes of walking daily.");
    }

   
    let riskLevel = "Low";
    if (score > 60) riskLevel = "High";
    else if (score > 30) riskLevel = "Medium";

    return { score, riskLevel, factors, recommendations };
};

module.exports = { calculateRisk };