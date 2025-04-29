// Typdefinitionen für Assessments und Fragen

export interface Question {
  id: string;
  text: string;
  type: 'scale' | 'multipleChoice' | 'checkbox' | 'text';
  required?: boolean;
  category?: string;
  explanation?: string;
  options?: {
    id: string;
    text: string;
    value: number;
  }[];
  scale?: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
}

export interface Answer {
  questionId: string;
  selectedOptions?: string[];
  scaleValue?: number;
  textValue?: string;
}

export interface AssessmentTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
  createdAt?: string;
}

export interface CompletedAssessment {
  id?: string;
  assessmentId: string;
  userId: string;
  relationshipId?: string;
  answers: Record<string, Answer>;
  score?: number;
  completedAt: string;
}

export interface AssessmentResult {
  id?: string;
  relationshipId: string;
  assessmentId: string;
  userIds: string[];
  scores: Record<string, number>;
  overallScore: number;
  createdAt: string;
}

export interface RelationshipAssessmentResult extends AssessmentResult {
  matchScores: Record<string, number>;
  overallMatchScore: number;
  strengthAreas: string[];
  growthAreas: string[];
  recommendations: string[];
} 