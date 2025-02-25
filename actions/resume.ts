"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
// import OpenAI from 'openai'; // Remove OpenAI import
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import Gemini

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function saveResume(content: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId
        }
    });

    if (!user) throw new Error("User not Found");

    try {
        const resume = await db.resume.upsert({
            where: {
                userId: user.id,
            },
            update: {
                content,
            },
            create: {
                userId: user.id,
                content
            }
        });

        revalidatePath("/resume");

        return resume;
    } catch (error) {
        console.error("Error saving resume:", error);
        return null;
    }
}

export async function getResume() {
    const { userId } = await auth();
    if (!userId) return null;

    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        });

        if (!user) return null;

        const resume = await db.resume.findUnique({
            where: {
                userId: user.id
            }
        });

        return resume || null;
    } catch (error) {
        console.error("Error getting resume:", error);
        return null;
    }
}

interface ImproveWithAIParams {
    current: string;
    type: string;
}

export async function improveWithAI({ current, type }: ImproveWithAIParams): Promise<string | null> {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized!");

    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            },
            include: {
                industryInsight: true
            }
        });

        if (!user) throw new Error("User not found");

        const prompt = `
            As an expert resume writer specializing in the ${user.industryInsight?.industry} industry, I will enhance the following ${type} description to be more impactful and results-oriented.

            **Current Description:** "${current}"

            **Instructions:**

            *   Focus on quantifiable achievements and contributions.  Use metrics (e.g., percentages, numbers, dollar amounts) whenever possible to demonstrate impact.
            *   Incorporate relevant keywords that are commonly used in the ${user.industryInsight?.industry} industry to improve applicant tracking system (ATS) compatibility.
            *   Use strong action verbs to highlight accomplishments (e.g., Led, Managed, Developed, Implemented, Optimized, Increased, Reduced, Streamlined).
            *   Ensure the description aligns with the candidate's experience level and target role.
            *   Prioritize clarity and conciseness, while still conveying the value the candidate brings.
            *   Maintain a professional and engaging tone that captures the reader's attention.

            **Desired Output:** An improved ${type} description that is concise, impactful, and tailored to the ${user.industryInsight?.industry} industry, demonstrating quantifiable achievements using strong action verbs and relevant keywords.
        `;

        // Call Gemini API
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });  // Choose a model
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const improvedDescription = response.text();

        return improvedDescription || null;

    } catch (error) {
        console.error("Error improving with AI (Gemini):", error);
        return null;
    }
}