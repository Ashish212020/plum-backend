

const parseOCRText = (text) => {
    const lowerText = text.toLowerCase();
    
    
    const ageMatch = lowerText.match(/age[:\s]+(\d+)/);
    const age = ageMatch ? parseInt(ageMatch[1]) : null;

    
    let smoker = undefined;

    
    if (lowerText.match(/smoker[:\s]+(yes|true|yup|1)/)) {
        smoker = true;
    } 
   
    else if (lowerText.match(/smoker[:\s]+(no|false|nope|0)/)) {
        smoker = false;
    }
   

    
    let diet = "unknown";
    if (lowerText.includes("high sugar") || lowerText.includes("junk") || lowerText.includes("fast food")) {
        diet = "high sugar";
    } else if (lowerText.includes("balanced") || lowerText.includes("healthy") || lowerText.includes("vegan")) {
        diet = "healthy";
    }

   
    let exercise = "unknown";
    if (lowerText.includes("rarely") || lowerText.includes("none") || lowerText.includes("sedentary")) {
        exercise = "rarely";
    } else if (lowerText.includes("daily") || lowerText.includes("regular") || lowerText.includes("active")) {
        exercise = "regular";
    }

   
    return { age, smoker, diet, exercise };
};

module.exports = { parseOCRText };

