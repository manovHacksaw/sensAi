"use server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/prisma"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
})

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

interface QuizData {
  questions: QuizQuestion[]
}

// Define the user answer
interface UserAnswer {
  [key: number]: string
}

export async function generateQuiz(): Promise<QuizQuestion[]> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  })

  if (!user) throw new Error("User not found")

  const userAssessments = await db.assessment.findMany({
    where: {
      userId: user.id,
    },
    take: 5, // Limit to the top 5
    orderBy: {
      createdAt: "desc",
    },
  })

  const lastQuestions = userAssessments.map((assessment) => assessment.questions)

  const prompt = `You are an expert technical interview question generator. Your task is to create 10 multiple-choice technical interview questions tailored to assess a ${user.industry} professional${user.skills?.length ? ` with demonstrable expertise in: ${user.skills.join(", ")}.` : "."} based on their skills and background. Their bio: ${user.bio}.

  To ensure originality and relevance, avoid repeating any questions from this list: ${lastQuestions}.
  
  The questions must span from beginner to advanced difficulty, covering a diverse spectrum of topics pertinent to their profession. Include a minimum of 3 questions specifically focused on assessing their understanding of recent advancements and emerging trends within the ${user.industry} industry.
  
  Each question MUST adhere to the following strict criteria:
  *   Exactly 4 answer options MUST be provided.
  *   Only ONE option MUST be designated as the "correctAnswer."
  *   The "explanation" MUST offer a thorough and insightful justification for WHY the selected "correctAnswer" is indeed the correct solution.
  
  Output the questions in a valid JSON format ONLY, structured as follows:
  
  \`\`\`json
  {
      "questions": [
          {
              "question": "A clear and concise question about a technical concept related to the candidate's role.",
              "options": [
                  "Option 1: A plausible, but potentially incorrect answer.",
                  "Option 2: Another plausible, but incorrect answer.",
                  "Option 3: The CORRECT answer.",
                  "Option 4: A distractor answer."
              ],
              "correctAnswer": "Option 3: The CORRECT answer.",
              "explanation": "A detailed explanation that clearly elucidates the reasoning behind Option 3 being the ONLY correct answer. It MUST explain WHY other options are wrong."
          },
          {
            "question": "Another Question...",
            "options": ["...", "...", "...", "..."],
            "correctAnswer": "...",
            "explanation": "..."
          },
          {
            "question": "Another Question...",
            "options": ["...", "...", "...", "..."],
            "correctAnswer": "...",
            "explanation": "..."
          },
          {
            "question": "Question on Latest Industry Trends",
            "options": ["...", "...", "...", "..."],
            "correctAnswer": "...",
            "explanation": "..."
          },
          {
            "question": "Question on Latest Industry Trends",
            "options": ["...", "...", "...", "..."],
            "correctAnswer": "...",
            "explanation": "..."
          },
          {
            "question": "Question on Latest Industry Trends",
            "options": ["...", "...", "...", "..."],
            "correctAnswer": "...",
            "explanation": "..."
          }
          // ...and four more questions following the same format to reach a total of 10.
      ]
  }
  \`\`\`
  
  IMPORTANT CONSTRAINTS:
  
  1.  ABSOLUTELY NO conversational text or introductory/concluding remarks should surround the JSON output. Return the JSON response DIRECTLY, without any additional markdown, preamble, or postamble.  The ENTIRE response MUST be parsable as valid JSON.
  2.  The "explanation" MUST explicitly state WHY the other answer options are incorrect.
  3. The questions should be challenging and insightful, appropriate for assessing experienced professionals in the specified industry and with the listed skills.
  4.  The quality of the explanations is paramount. They must be well-reasoned and technically accurate.
  5.  The "options" should be diverse and not very similar to each other.
  `

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("Invalid response from Gemini API: No candidates found")
    }

    let text = response.candidates[0].content.parts[0].text || "{}" // Default to empty JSON object

    text = text.replace(/```(?:json)?\n?([\s\S]*?)\n?```/i, "$1") // Remove code blocks
    text = text.trim() //Remove leading/trailing whitespace

    //Validate JSON
    if (!text || text === "{}") {
      throw new Error("Gemini API returned empty or invalid JSON.")
    }

    try {
      const parsedData: QuizData = JSON.parse(text) // Added type assertion.
      return parsedData.questions
    } catch (jsonError: any) {
      console.error("Error parsing JSON:", text)
      throw new Error(`Error parsing JSON response from Gemini API: ${jsonError.message}`)
    }
  } catch (error: any) {
    console.error("Error generating quiz:", error)
    throw new Error(`Failed to generate quiz: ${error.message}`) //Wrap any error so it doesn't crash the application
  }
}

// Save Quiz with user answers
export async function saveQuiz(answers: UserAnswer): Promise<{ quizScore: number; improvementTip: string }> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  })

  if (!user) throw new Error("User not found")

  // Get questions, and catch for errors
  let questions: QuizQuestion[]
  try {
    questions = await generateQuiz()
  } catch (error: any) {
    console.error("Failed to generate quiz before saving.", error)
    throw new Error(`Failed to generate quiz before saving: ${error.message}`)
  }

  // Make sure the questions are valid and follow schema
  if (!questions || !Array.isArray(questions)) {
    throw new Error("Invalid questions array, needs to be a non-null array")
  }

  // Check if answers is defined and is an object
  if (!answers || typeof answers !== "object" || Object.keys(answers).length === 0) {
    throw new Error("The answers object is not defined or is empty.")
  }

  // Calculate Score:
  let correctAnswers = 0

  // Convert object keys to numbers and ensure they're sorted
  const answerKeys = Object.keys(answers)
    .map(Number)
    .sort((a, b) => a - b)

  // Loop through each question to see if the result is correct
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i]
    const userAnswer = answers[i] // Get the answer for this question index

    if (question && userAnswer === question.correctAnswer) {
      correctAnswers++
    }
  }

  // Calculate score as a percentage
  const score = (correctAnswers / questions.length) * 100

  // Create question results for storing in the database
  const questionResults = questions.map((q, index) => ({
    question: q.question,
    correctAnswer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }))

  // Generate improvement tips for wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect)
  let improvementTip = "Great job! You've mastered these concepts." // Default value for perfect scores

  if (wrongAnswers.length > 0) {
    const wrongAnswersText = wrongAnswers
      .map((q) => `Question: ${q.question}\nCorrect Answer: ${q.correctAnswer}\nUser Answer: ${q.userAnswer}`)
      .join("\n\n")

    const improvementPrompt = `The User got the following ${user.industry} technical questions wrong: 

    ${wrongAnswersText}

    Based on these mistakes, provide a concise, specific improvement tip.
    Focus on the knowledge gaps revealed by these wrong answers, keep the answer in 3 sentences, and make it sound encouraging. 
     `

    try {
      const result = await model.generateContent(improvementPrompt)
      const response = await result.response

      if (!response || !response.candidates || response.candidates.length === 0) {
        console.warn("No improvement suggestions received from Gemini API.")
        improvementTip =
          "Focus on reviewing the concepts you missed and practice with similar questions to strengthen your understanding."
      } else {
        improvementTip = response.candidates[0].content.parts[0].text || "Focus on reviewing the concepts you missed."
        improvementTip = improvementTip.replace(/```(?:json)?\n?([\s\S]*?)\n?```/i, "$1") // Remove code blocks
        improvementTip = improvementTip.trim() // Remove leading/trailing whitespace
      }
    } catch (error: any) {
      console.error("Error generating or parsing improvement suggestion:", error)
      improvementTip = "Focus on reviewing the concepts you missed and practice with similar questions."
    }
  }

  try {
    console.log("Saving assessment with score:", score) // Debug log

    // Create the assessment in the database
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip: improvementTip,
      },
    })

    return {
      quizScore: score,
      improvementTip: improvementTip,
    }
  } catch (dbError: any) {
    console.error("Error creating assessment in database:", dbError)
    throw new Error(`Failed to save assessment to the database: ${dbError.message}`)
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized")

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  })

  if (!user) throw new Error("User not found")

  try {
    const assessments = await db.assessment.findMany({
      where:{
        userId: user.id,
      },
      orderBy:{
        createdAt: "desc"
      }
    })

    return assessments;
  } catch (error) {
    
  }
  
}