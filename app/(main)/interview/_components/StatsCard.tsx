import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metric } from './Metric';


interface Assessment {
  id: string;
  userId: string;
  quizScore: number;
  questions: any[]; //  Define a more specific type if the structure is known
  category: string;
  improvementTip: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StatsCardProps {
  assessments: Assessment[];
}

const StatsCard: React.FC<StatsCardProps> = ({ assessments }) => {
  const getAverageScore = (): string => {
    if (!assessments || assessments.length === 0) {
      return "0.0";
    }

    const total = assessments.reduce((sum, assessment) => sum + assessment.quizScore, 0);

    return (total / assessments.length).toFixed(1);
  };

  const assessmentCount = assessments?.length || 0;
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Metric label="Average Score">{getAverageScore()}</Metric>
        <Metric label="Number of Assessments">{assessmentCount}</Metric>
      </CardContent>
    </Card>
  );
};

export default StatsCard;