"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"
import {GoogleGenerativeAI} from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",

})

export async function generateAIInsights (industry: string) {
        const prompt = ` Analyze the current state of the ${industry} industry and provide insights on the salary ranges, growth rate, demand level, top skills, market outlook, key trends, and recommended skills. ONLY in the following JSON Format without any additional notes or explanations: 
        \`\`\`json
        {
            "salaryRanges": [
            {"role": "string", "min": number, "max": number, "median": number, "location": "string"}
            ],
            "growthRate": number,
            "demandLevel": "LOW" | "MEDIUM" | "HIGH",
            "topSkills": ["string", "string", "string"],
            "marketOutlook": "NEGATIVE" | "NEUTRAL" | "POSITIVE",
            "keyTrends": ["string", "string", "string"],
            "recommendedSkills": ["string", "string", "string"]
        }

        IMPORTANT: RETURN ONLY THE JSON. DO NOT INCLUDE ANY ADDITIONAL TEXT, MARKDOWN FORMATTING OR COMMENTS. INLCUDE ATLEAST 5 COMMON ROLES FOR SALARY RANGES. 
        GROWTH RATE SHOULD BE A PERCENTAGE, A FLOAT NUMBER BETWEEN 0 TO 100.
        INCLUDE ATLEAST 5 TOP SKILLS AND 3 KEY TRENDS AND 5 RECOMMENDED SKILLS.

        \`\`\`
        `;

     
    
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```(?:json)?\n?([\s\S]*?)\n?```/i, '$1'); // Remove code blocks
        text = text.trim();  //Remove leading/trailing whitespace

        // Attempt to parse the JSON, handle errors if parsing fails.
        try {
            const parsedData = JSON.parse(text);
            return parsedData;
        } catch (error) {
            console.error("Failed to parse JSON:", error);
            console.error("Raw response from Gemini:", text); // Log the raw response
            return null; // or throw error, depending on desired behavior
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        return null; // or throw error, depending on desired behavior
    }
}

export async function getIndustryInsights() { // Define data type or remove it.  It wasn't being used.
    const {userId} = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: {
          clerkUserId: userId,
        },
        include: {
          industryInsight: true // Include the related IndustryInsight data
        }
      });

    if (!user) {
      throw new Error("User not found");
    }

    if(!user.industryInsight) {
        const insights = await generateAIInsights(user.industry);

        if (!insights) {
            return null;  // Or throw an error, depending on desired behavior
        }

        const industryInsight = await db.industryInsight.create({
            data: {
                industry: user.industry,
                salaryRanges: insights.salaryRanges,
                growthRate: insights.growthRate,
                demandLevel: insights.demandLevel,
                topSkills: insights.topSkills,
                marketOutlook: insights.marketOutlook,
                keyTrends: insights.keyTrends,
                recommendedSkills: insights.recommendedSkills,
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                userId: user.id,
            }
        });

        return industryInsight;
    }

    return user.industryInsight;
}