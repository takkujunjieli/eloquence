import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "PLACEHOLDER_KEY";

const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

export const scoringModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});
