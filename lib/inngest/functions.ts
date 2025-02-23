import { db } from "@/lib/prisma"; // Import the Prisma client for database interactions
import { inngest } from "./client"; // Import the Inngest client for workflow management
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import the Google Generative AI library

// Initialize the Google Generative AI model.  This should be done outside the function for efficiency.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Initialize Google Generative AI with API key from environment variables
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Specify the model to use.

// Define the Inngest function for generating industry insights
export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" }, // Give the function a descriptive name
  { cron: "0 0 * * 0" }, // Schedule the function to run every Sunday at midnight (CRON expression)
  async ({ event, step }) => {
    // Step 1: Fetch industries from the database
    const industries = await step.run("Fetch industries", async () => {
      // Use Prisma to query the database for distinct industry names.  Note:  You might want to add `distinct: ['industry']` here to avoid redundant processing
      return await db.industryInsight.findMany({
        select: { industry: true }, // Select only the 'industry' field
      });
    });

    // Step 2: Iterate through the fetched industries and generate insights for each
    for (const { industry } of industries) {
      // Define the prompt for the AI model. This is the core instruction for generating industry insights.
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

        IMPORTANT: RETURN ONLY THE JSON. DO NOT INCLUDE ANY ADDITIONAL TEXT, MARKDOWN FORMATTING OR COMMENTS. INLCUDE ATLEAST 5 COMMON ROLES FOR SALARY RANGES,. 
        GROWTH RATE SHOULD BE A PERCENTAGE, A FLOAT NUMBER BETWEEN 0 TO 100.
        INCLUDE ATLEAST 5 TOP SKILLS AND 3 KEY TRENDS AND 5 RECOMMENDED SKILLS.

        \`\`\`
        `;

      // Step 3: Call the AI model to generate insights for the current industry
      const res = await step.ai.wrap(
        "gemini", // Name of the integration (Gemini in this case)
        async (p) => {
          // Asynchronous function to call the AI model with the prompt
          return await model.generateContent(p); // Call the Gemini API to generate content based on the prompt
        },
        prompt // Pass the prompt to the AI model
      );

      // Step 4: Process the AI model's response
      const text = res.response.candidates[0].content.parts[0].text || ""; // Extract the generated text from the response, default to empty string
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim(); // Remove code block markers and trim whitespace to clean up response

      // Step 5: Parse the cleaned text as JSON
      const insights = JSON.parse(cleanedText); // Parse the cleaned JSON string into a JavaScript object

      // Step 6: Update the industry insights in the database
      await step.run(`Update ${industry} insights`, async () => {
        // Use Prisma to update the industry insight in the database
        await db.industryInsight.update({
          where: { industry }, // Find the industry to update based on the industry name
          data: {
            ...insights, // Spread the new insights data into the update
            lastUpdated: new Date(), // Update the last updated timestamp
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Schedule the next update for one week from now
          },
        });
      });
    }
  }
);