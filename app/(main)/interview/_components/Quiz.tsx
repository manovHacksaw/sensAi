"use client"

import { generateQuiz, saveQuiz } from '@/actions/interview';
import useFetch from '@/hooks/useFetch';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Quiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showExplanation, setShowExplanation] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [loadingQuiz, setLoadingQuiz] = useState(false);

    const {
        loading: generatingQuiz,
        fn: generateQuizFn,
        data: quizData,
        error
    } = useFetch(generateQuiz);
    console.log("QUIZ DATA: ", quizData)

    const {loading: savingResult, fn: saveQuizResultFn, data: resultData, setData: setResultData} = useFetch(saveQuiz);

    const showResult = async() =>{
        try {
            await saveQuizResultFn(answers);
            console.log(resultData);;
        } catch (error) {
            
        }
    }

    const startQuiz = async () => {
        setLoadingQuiz(true);
        try {
            const response =await generateQuizFn();
            console.log(response)
            setQuizStarted(true);
        } catch (err) {
            console.error("Error generating quiz:", err);
        } finally {
            setLoadingQuiz(false);
        }
    };

    const handleAnswer = (selectedAnswer) => {
        setAnswers([...answers, selectedAnswer]);
        setShowExplanation(true);
    };

    const goToNextQuestion = () => {
        setShowExplanation(false);
        setCurrentQuestion(currentQuestion + 1);
    };

    const handleRestartQuiz = () => {
        setCurrentQuestion(0);
        setAnswers([]);
        setShowExplanation(false);
        setQuizStarted(false);
    };

    if (!quizStarted) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome to the Technical Interview Quiz</CardTitle>
                    <CardDescription>Test your knowledge with 10 challenging questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-gray-600">
                            This quiz will help you prepare for technical interviews by:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>Testing your understanding of key concepts</li>
                            <li>Providing detailed explanations for each answer</li>
                            <li>Simulating real interview scenarios</li>
                        </ul>
                    </div>
                    <Button 
                        className="w-full" 
                        onClick={startQuiz} 
                        disabled={generatingQuiz || loadingQuiz}
                    >
                        {generatingQuiz || loadingQuiz ? "Generating Questions..." : "Start Quiz"}
                    </Button>
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                Failed to generate quiz: {error.message}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        );
    }

    if (!quizData) {
        return (
            <Card className="w-full">
                <CardContent className="flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="text-gray-600">Loading your quiz questions...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (currentQuestion >= quizData.length) {
        const correctAnswers = quizData.reduce((acc, question, index) => 
            question.correctAnswer === answers[index] ? acc + 1 : acc, 0);
        const percentage = (correctAnswers / quizData.length) * 100;

        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Quiz Complete! 🎉</CardTitle>
                    <CardDescription>Here's how you performed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Score</span>
                            <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentage} />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-2xl font-semibold">
                            {correctAnswers} out of {quizData.length} correct
                        </p>
                        <p className="text-gray-600">
                            {percentage >= 80 ? "Excellent work! You're well-prepared!" :
                             percentage >= 60 ? "Good job! Keep practicing!" :
                             "Keep studying! You'll improve!"}
                        </p>
                    </div>
                    <Button 
                        className="w-full" 
                        onClick={handleRestartQuiz}
                    >
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const currentQuizQuestion = quizData[currentQuestion];
    const isCorrect = showExplanation && answers[currentQuestion] === currentQuizQuestion.correctAnswer;

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center mb-4">
                    <CardTitle>Question {currentQuestion + 1}</CardTitle>
                    <span className="text-sm text-gray-500">
                        {currentQuestion + 1} of {quizData.length}
                    </span>
                </div>
                <Progress value={(currentQuestion / quizData.length) * 100} className="mb-4" />
                <CardDescription className="text-lg font-medium text-gray-900">
                    {currentQuizQuestion.question}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3">
                    {currentQuizQuestion.options.map((option, index) => (
                        <Button
                            key={index}
                            variant={showExplanation ? 
                                (option === currentQuizQuestion.correctAnswer ? "success" :
                                 option === answers[currentQuestion] ? "destructive" : "outline") : 
                                "outline"
                            }
                            className="w-full text-left justify-start h-auto py-3 px-4"
                            onClick={() => handleAnswer(option)}
                            disabled={showExplanation}
                        >
                            {option}
                        </Button>
                    ))}
                </div>

                {showExplanation && (
                    <div className="space-y-4 mt-6">
                        <Alert variant={isCorrect ? "success" : "destructive"}>
                            {isCorrect ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : (
                                <XCircle className="h-4 w-4" />
                            )}
                            <AlertTitle>
                                {isCorrect ? "Correct!" : "Incorrect"}
                            </AlertTitle>
                            <AlertDescription>
                                {currentQuizQuestion.explanation}
                            </AlertDescription>
                        </Alert>
                        <Button 
                            className="w-full" 
                            onClick={goToNextQuestion}
                        >
                            Next Question
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default Quiz;