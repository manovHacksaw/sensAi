"use server"
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizData {
  questions: QuizQuestion[];
}

//Define the user answer
interface UserAnswer {
  [key: number]: string;
}

export async function generateQuiz(): Promise<QuizQuestion[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `Generate 10 multiple-choice technical interview questions designed to assess a ${
    user.industry
  } professional${
    user.skills?.length ? ` with notable expertise in the following skills: ${user.skills.join(", ")}.` : "."
  } The questions should range from beginner to advanced, covering a wide range of topics relevant to their role. Include at least 2 questions that test knowledge on the latest industry trends. Each question must have exactly 4 options, only one of which is the correct answer. Provide a concise, yet comprehensive explanation for the correct answer.
  Return the questions in the following JSON format:

  \`\`\`json
  {
    "questions": [
      {
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correctAnswer": "string",
        "explanation": "string"
      },
      ... (9 more questions)
    ]
  }
  \`\`\`

  IMPORTANT:
  * Ensure the JSON is well-formed and valid.
  * Each question must have precisely four distinct options.
  * "correctAnswer" must be one of the options provided.
  * The "explanation" should be detailed and provide reasoning behind the correct choice.
  * VERY IMPORTANT: Minimize any additional text or commentary outside the JSON structure. Return ONLY JSON, no surrounding markdown, comments, or intro/outro paragraphs.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("Invalid response from Gemini API: No candidates found");
    }

    let text = response.candidates[0].content.parts[0].text || "{}"; // Default to empty JSON object

    text = text.replace(/```(?:json)?\n?([\s\S]*?)\n?```/i, "$1"); // Remove code blocks
    text = text.trim(); //Remove leading/trailing whitespace

    //Validate JSON
    if (!text || text === "{}") {
      throw new Error("Gemini API returned empty or invalid JSON.");
    }

    try {
      const parsedData: QuizData = JSON.parse(text); // Added type assertion.
      return parsedData.questions;
    } catch (jsonError: any) {
      console.error("Error parsing JSON:", text);
      throw new Error(`Error parsing JSON response from Gemini API: ${jsonError.message}`);
    }
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    throw new Error(`Failed to generate quiz: ${error.message}`); //Wrap any error so it doesn't crash the application
  }
}

//Save Quiz must have user answers.
export async function saveQuiz(answers: UserAnswer) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Use `findUnique` instead of `findMany` to fetch a single user. The original function was running fine but adding best practice for data usage
  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error("User not found");

  // Get questions, and catch for errors
  let questions: QuizQuestion[];
  try {
    questions = await generateQuiz();
  } catch (error: any) {
    console.error("Failed to generate quiz before saving.", error);
    throw new Error(`Failed to generate quiz before saving: ${error.message}`);
  }

  // Make sure the questions are valid and follow schema
  if (!questions || !Array.isArray(questions)) {
    throw new Error("Invalid questions array, needs to be a non-null array");
  }

   // Check if answers is defined and is an object
  if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
        throw new Error("The answers object is not defined or is empty.");
  }

  // Calculate Score:

  let correctAnswers = 0;

    //Loop through each question to see if the result is correct
  for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswer = answers[i];  // Get the answer in that question
        if (question && userAnswer === question.correctAnswer) {
            correctAnswers++;
        }
  }

  const score = (correctAnswers/ questions.length) * 100; //This returns the percentage to have a quantifiable answer.
  const questionResults = questions.map((q, index) => ({
    question: q.question,
    correctAnswer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  console.log(`printing question results: ${JSON.stringify(questionResults, null, 2)}`);

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
  let improvementTip = "No specific improvements available." //Provide a default value.
  if (wrongAnswers.length > 0) {
    const wrongAnswersText = wrongAnswers
      .map(
        (q) =>
          `Question: ${q.question}\nCorrect Answer: ${q.correctAnswer}\nUser Answer: ${q.userAnswer}`
      )
      .join("\n\n");

    const improvementPrompt = `The User got the following ${user.industry} technical questions wrong: 

    ${wrongAnswersText}

    Based on these mistakes, provide a concise, specific improvement tip.
    Focus on the knowledge gaps revealed by these wrong answers, keep the answer in 3 sentences, and make it sound encouraging. 
     `;

    try {
      const result = await model.generateContent(improvementPrompt);
      const response = await result.response;

      if (!response || !response.candidates || response.candidates.length === 0) {
        console.warn("No improvement suggestions received from Gemini API.");
        improvementTip = "No specific improvements available at this time";
      } else {
        improvementTip = response.candidates[0].content.parts[0].text || "No specific improvements available.";

          improvementTip = improvementTip.replace(/```(?:json)?\n?([\s\S]*?)\n?```/i, '$1'); // Remove code blocks
          improvementTip = improvementTip.trim();  //Remove leading/trailing whitespace

        console.log("Improvement Suggestions:" + improvementTip); // Log the improvements
      }
    } catch (error: any) {
      console.error("Error generating or parsing improvement suggestion:", error);
      improvementTip = `Error generating improvements: ${error.message}`;
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: JSON.stringify(questionResults), //Saving as stringified JSON
        category: "Technical",
        improvementTip: improvementTip,
      },
    });
    console.log(`Assessment created successfully with ID: ${assessment.id}`);
  } catch (dbError: any) {
    console.error("Error creating assessment in database:", dbError);
    throw new Error(`Failed to save assessment to the database: ${dbError.message}`);
  }
}