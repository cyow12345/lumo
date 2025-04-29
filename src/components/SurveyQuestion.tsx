import React from 'react';
import { Question, Answer } from '../models/Assessment';
import './SurveyQuestion.css';

interface SurveyQuestionProps {
  question: Question;
  answer?: Answer;
  onChange: (answer: Answer) => void;
}

const SurveyQuestion: React.FC<SurveyQuestionProps> = ({ question, answer, onChange }) => {
  // Standardantwort für den Fragetyp erstellen
  const createDefaultAnswer = (): Answer => ({
    questionId: question.id,
    selectedOptions: [],
    scaleValue: undefined,
    textValue: ''
  });
  
  // Aktuelle Antwort oder Standardantwort verwenden
  const currentAnswer = answer || createDefaultAnswer();
  
  // Handler für Scale-Typ
  const handleScaleChange = (value: number) => {
    onChange({
      ...currentAnswer,
      scaleValue: value
    });
  };
  
  // Handler für Multiple-Choice
  const handleMultipleChoiceChange = (optionId: string) => {
    onChange({
      ...currentAnswer,
      selectedOptions: [optionId]
    });
  };
  
  // Handler für Checkbox
  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    let newSelectedOptions = [...(currentAnswer.selectedOptions || [])];
    
    if (checked) {
      newSelectedOptions.push(optionId);
    } else {
      newSelectedOptions = newSelectedOptions.filter(id => id !== optionId);
    }
    
    onChange({
      ...currentAnswer,
      selectedOptions: newSelectedOptions
    });
  };
  
  // Handler für Text
  const handleTextChange = (text: string) => {
    onChange({
      ...currentAnswer,
      textValue: text
    });
  };
  
  // Render je nach Fragetyp
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'scale':
        return (
          <div className="scale-container">
            <div className="scale-labels">
              <span>{question.scale?.minLabel || 'Niedrig'}</span>
              <span>{question.scale?.maxLabel || 'Hoch'}</span>
            </div>
            <div className="scale-options">
              {Array.from({ length: (question.scale?.max || 5) - (question.scale?.min || 1) + 1 }).map((_, index) => {
                const value = (question.scale?.min || 1) + index;
                return (
                  <button
                    key={`scale-${value}`}
                    className={`scale-option ${currentAnswer.scaleValue === value ? 'selected' : ''}`}
                    onClick={() => handleScaleChange(value)}
                    type="button"
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      
      case 'multipleChoice':
        return (
          <div className="options-container">
            {question.options?.map(option => (
              <div
                key={option.id}
                className={`option-item ${currentAnswer.selectedOptions?.includes(option.id) ? 'selected' : ''}`}
                onClick={() => handleMultipleChoiceChange(option.id)}
              >
                <div className="option-radio">
                  <div className="radio-dot"></div>
                </div>
                <span className="option-text">{option.text}</span>
              </div>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="options-container">
            {question.options?.map(option => (
              <div
                key={option.id}
                className={`option-item checkbox ${currentAnswer.selectedOptions?.includes(option.id) ? 'selected' : ''}`}
                onClick={() => handleCheckboxChange(
                  option.id,
                  !currentAnswer.selectedOptions?.includes(option.id)
                )}
              >
                <div className="option-checkbox">
                  <div className="checkbox-mark"></div>
                </div>
                <span className="option-text">{option.text}</span>
              </div>
            ))}
          </div>
        );
      
      case 'text':
        return (
          <textarea
            className="text-input"
            value={currentAnswer.textValue || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Gib deine Antwort hier ein..."
            rows={4}
          />
        );
      
      default:
        return <div>Unsupported question type</div>;
    }
  };
  
  return (
    <div className="survey-question">
      <div className="question-header">
        <h3 className="question-text">{question.text}</h3>
        {question.required && <span className="required-mark">*</span>}
      </div>
      
      <div className="question-content">
        {renderQuestionInput()}
      </div>
      
      {question.explanation && (
        <div className="question-explanation mt-2 text-sm text-gray-600 italic">
          {question.explanation}
        </div>
      )}
    </div>
  );
};

export default SurveyQuestion; 