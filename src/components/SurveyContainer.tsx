import React, { useState, useCallback } from 'react';
import { AssessmentTemplate, Question, Answer } from '../models/Assessment';
import SurveyQuestion from './SurveyQuestion';
import './SurveyContainer.css';

interface SurveyContainerProps {
  assessment: AssessmentTemplate;
  onComplete: () => void;
  onCancel: () => void;
  onSaveAnswers?: (answers: { [questionId: string]: Answer }) => void;
}

const SurveyContainer: React.FC<SurveyContainerProps> = ({
  assessment,
  onComplete,
  onCancel,
  onSaveAnswers
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: Answer }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const questions = assessment.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  const handleAnswerChange = useCallback((answer: Answer) => {
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [answer.questionId]: answer
      };
      
      // Wenn es einen onSaveAnswers-Handler gibt, rufe ihn mit den aktualisierten Antworten auf
      if (onSaveAnswers) {
        onSaveAnswers(newAnswers);
      }
      
      return newAnswers;
    });
  }, [onSaveAnswers]);
  
  const canProceed = useCallback(() => {
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return true;
    
    const answer = answers[currentQuestion.id];
    if (!answer) return false;
    
    // Überprüfen, ob die Antwort gültig ist (je nach Typ)
    switch (currentQuestion.type) {
      case 'scale':
        return typeof answer.scaleValue === 'number';
      case 'multipleChoice':
        return Array.isArray(answer.selectedOptions) && answer.selectedOptions.length > 0;
      case 'checkbox':
        return Array.isArray(answer.selectedOptions) && answer.selectedOptions.length > 0;
      case 'text':
        return answer.textValue && answer.textValue.trim() !== '';
      default:
        return true;
    }
  }, [currentQuestion, answers]);
  
  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else if (canProceed()) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      alert("Bitte beantworte diese Frage, bevor du fortfährst.");
    }
  };
  
  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Speichere die endgültigen Antworten, bevor wir vollständig abschließen
      if (onSaveAnswers) {
        onSaveAnswers(answers);
      }
      
      // In einer echten App würden hier die Antworten an einen Server gesendet
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete();
    } catch (error) {
      console.error('Fehler beim Speichern des Assessments:', error);
      alert("Beim Speichern deiner Antworten ist ein Fehler aufgetreten. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  return (
    <div className="survey-container">
      <div className="survey-header">
        <h2 className="survey-title">{assessment.title}</h2>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercentage}%` }} 
        />
      </div>
      
      <div className="progress-text">
        Frage {currentQuestionIndex + 1} von {questions.length}
      </div>
      
      <div className="question-container">
        <SurveyQuestion
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          onChange={handleAnswerChange}
        />
      </div>
      
      <div className="survey-navigation">
        <button 
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={isFirstQuestion || isSubmitting}
        >
          Zurück
        </button>
        
        <div className="nav-right">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Abbrechen
          </button>
          
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={isSubmitting || (currentQuestion.required && !canProceed())}
          >
            {isLastQuestion ? 'Abschließen' : 'Weiter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyContainer; 