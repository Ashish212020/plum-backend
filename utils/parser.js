const parseOCRText = (text) => {
    const lowerText = text.toLowerCase();
    const ageMatch = lowerText.match(/age[:\s]+(\d+)/);
    const age = ageMatch ? parseInt(ageMatch[1]) : null;

    const smokerMatch = lowerText.match(/smoker[:\s]+(yes|true|yup|1)/);
    const smoker = !!smokerMatch; 
    let diet = "unknown";
    if (lowerText.includes("high sugar") || lowerText.includes("junk")) diet = "high sugar";
    else if (lowerText.includes("balanced") || lowerText.includes("healthy")) diet = "healthy";

    let exercise = "unknown";
    if (lowerText.includes("rarely") || lowerText.includes("none")) exercise = "rarely";
    else if (lowerText.includes("daily") || lowerText.includes("regular")) exercise = "regular";

    return { age, smoker, diet, exercise };
};

module.exports = { parseOCRText };