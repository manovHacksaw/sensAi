"use client"

import { generateQuiz, saveQuiz } from '@/actions/interview';
import useFetch from '@/hooks/useFetch';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, XCircle, Timer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';

const Quiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showExplanation, setShowExplanation] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const {
        loading: generatingQuiz,
        fn: generateQuizFn,
        data: quizData,
        error
    } = useFetch(generateQuiz);

    const {
        loading: savingResult,
        fn: saveQuizResultFn,
        error: saveError
    } = useFetch(saveQuiz);

    const startQuiz = async () => {
        setLoadingQuiz(true);
        try {
            await generateQuizFn();
            setQuizStarted(true);
            toast.success("Quiz generated successfully!");
        } catch (err) {
            toast.error("Failed to generate quiz. Please try again.");
        } finally {
            setLoadingQuiz(false);
        }
    };

    const handleAnswer = (selectedAnswer) => {
        setAnswers([...answers, selectedAnswer]);
        setShowExplanation(true);
    };

    const calculateScore = () => {
        let correct = 0;
        answers.forEach((answer, index) => {
            if (answer === quizData[index].correctAnswer) {
                correct++;
            }
        });
        return (correct / quizData?.length) * 100;
    };

    const finishQuiz = async () => {
        const score = calculateScore();
        
        // Format the quiz data to match the expected type
        const quizResults = {
            questions: quizData.map((q, index) => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                userAnswer: answers[index]
            })),
            score: score,
            totalQuestions: quizData.length,
            correctAnswers: answers.filter((answer, index) => 
                answer === quizData[index].correctAnswer
            ).length
        };

        try {
            await saveQuizResultFn({
                questions: quizResults.questions,
                score: quizResults.score
            });
            setQuizCompleted(true);
            toast.success("Quiz completed and results saved!");
        } catch (error) {
            toast.error(error.message || "Failed to save quiz results");
            console.error("Save error:", error);
        }
    };


    const goToNextQuestion = () => {
        if (currentQuestion < quizData?.length - 1) {
            setShowExplanation(false);
            setCurrentQuestion(currentQuestion + 1);
        } else {
            finishQuiz();
        }
    };

    const handleRestartQuiz = () => {
        setCurrentQuestion(0);
        setAnswers([]);
        setShowExplanation(false);
        setQuizStarted(false);
        setQuizCompleted(false);
    };

    if (!quizStarted) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Technical Interview Quiz</CardTitle>
                    <CardDescription>Challenge yourself with tailored interview questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold mb-2">What to expect:</h3>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>10 carefully curated technical questions</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Timer className="h-4 w-4 text-blue-500" />
                                    <span>Take your time to think through each answer</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-purple-500" />
                                    <span>Detailed explanations for each question</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <Button 
                        className="w-full" 
                        onClick={startQuiz} 
                        disabled={generatingQuiz || loadingQuiz}
                    >
                        {generatingQuiz || loadingQuiz ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Generating Questions...</span>
                            </div>
                        ) : (
                            "Start Quiz"
                        )}
                    </Button>
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error.message}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        );
    }

    if (!quizData) {
        return (
            <Card className="w-full">
                <CardContent className="flex items-center justify-center p-12">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="text-gray-600">Preparing your questions...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (quizCompleted || currentQuestion >= quizData.length) {
        const correctAnswers = quizData.reduce((acc, question, index) => 
            question.correctAnswer === answers[index] ? acc + 1 : acc, 0);
        const percentage = (correctAnswers / quizData.length) * 100;

        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        Quiz Complete!
                    </CardTitle>
                    <CardDescription>Your results have been saved</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">Final Score</span>
                                <span className="text-xl font-bold">{percentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-semibold mb-2">
                                {correctAnswers} out of {quizData.length} correct
                            </p>
                            <p className="text-gray-600">
                                {percentage >= 80 ? "Outstanding performance! You're interview-ready!" :
                                 percentage >= 60 ? "Good progress! Keep practicing to improve further!" :
                                 "Keep learning and practicing - you'll get there!"}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Button 
                            className="w-full"
                            onClick={handleRestartQuiz}
                        >
                            Take Another Quiz
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const currentQuizQuestion = quizData[currentQuestion];
    const isCorrect = showExplanation && answers[currentQuestion] === currentQuizQuestion.correctAnswer;
    const isLastQuestion = currentQuestion === quizData.length - 1;

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
                            {isLastQuestion ? "Finish Quiz" : "Next Question"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default Quiz;