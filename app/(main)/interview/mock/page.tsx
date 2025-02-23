import Link from "next/link";
import Quiz from "../_components/Quiz";
import { ArrowLeft } from "lucide-react";

export default function MockInterviewPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Link href="/interview-preparation" className="flex items-center text-blue-500 hover:text-blue-700 transition-colors duration-200">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Interview Preparation
      </Link>

      <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-4">Mock Interview</h1>
        <p className="text-gray-700 leading-relaxed text-center mb-8">
          Sharpen your interview skills with realistic, AI-powered technical questions tailored to your industry. Get personalized feedback and identify areas for improvement to ace your next interview!
        </p>

        <Quiz />
      </div>
    </div>
  );
}