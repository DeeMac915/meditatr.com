const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
};

const validateMeditationInput = (inputData) => {
    const errors = [];

    if (!inputData.goal || inputData.goal.trim().length < 10) {
        errors.push("Goal must be at least 10 characters long");
    }

    if (!inputData.mood || inputData.mood.trim().length === 0) {
        errors.push("Mood is required");
    }

    if (!inputData.challenges || inputData.challenges.trim().length < 10) {
        errors.push("Challenges must be at least 10 characters long");
    }

    if (!inputData.affirmations || inputData.affirmations.trim().length < 10) {
        errors.push("Affirmations must be at least 10 characters long");
    }

    if (
        !inputData.duration ||
        inputData.duration < 5 ||
        inputData.duration > 60
    ) {
        errors.push("Duration must be between 5 and 60 minutes");
    }

    if (
        !inputData.voicePreference ||
        !["male", "female"].includes(inputData.voicePreference)
    ) {
        errors.push("Voice preference must be either male or female");
    }

    if (
        !inputData.backgroundAudio ||
        !["nature", "ocean", "rain", "forest", "528-hz", "sleep"].includes(
            inputData.backgroundAudio
        )
    ) {
        errors.push("Invalid background audio selection");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

const sanitizeInput = (input) => {
    if (typeof input === "string") {
        return input.trim().replace(/[<>]/g, "");
    }
    return input;
};

const validatePaymentAmount = (amount) => {
    return typeof amount === "number" && amount > 0 && amount <= 1000;
};

export {
    validateEmail,
    validatePhoneNumber,
    validateMeditationInput,
    sanitizeInput,
    validatePaymentAmount,
};
