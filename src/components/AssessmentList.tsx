import React, { useEffect, useState } from 'react';
import { getAllAssessments } from '../data/assessmentData';
import { AssessmentTemplate } from '../models/Assessment';
import './AssessmentList.css';

interface AssessmentListProps {
  onSelectAssessment: (assessment: AssessmentTemplate) => void;
}

const AssessmentList: React.FC<AssessmentListProps> = ({ onSelectAssessment }) => {
  const [assessments, setAssessments] = useState<AssessmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assessment-Daten laden
    const loadAssessments = () => {
      try {
        const allAssessments = getAllAssessments();
        setAssessments(allAssessments);
      } catch (error) {
        console.error('Fehler beim Laden der Assessments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, []);

  if (loading) {
    return <div className="loading">Assessments werden geladen...</div>;
  }

  if (assessments.length === 0) {
    return <div className="empty-state">Keine Assessments verfügbar</div>;
  }

  return (
    <div className="assessment-list">
      <h2 className="assessment-list-title">Verfügbare Assessments</h2>
      <p className="assessment-list-subtitle">
        Wähle ein Assessment, um mehr über deine Beziehung zu erfahren
      </p>
      
      {assessments.map(assessment => {
        // Geschätzte Zeit basierend auf Anzahl der Fragen berechnen
        const estimatedTimeMinutes = Math.max(5, Math.ceil(assessment.questions.length * 0.5));
        
        return (
          <div
            key={assessment.id}
            className="assessment-card"
            onClick={() => onSelectAssessment(assessment)}
          >
            <div className="assessment-card-header">
              <h3 className="assessment-card-title">{assessment.title}</h3>
              <div className="assessment-card-time">
                <span className="time-icon">⏱️</span> 
                <span>{estimatedTimeMinutes} Min.</span>
              </div>
            </div>
            
            <p className="assessment-card-description">{assessment.description}</p>
            
            <div className="assessment-card-footer">
              <span className="questions-count">
                {assessment.questions.length} Fragen
              </span>
              <div className="start-link">
                <span>Starten</span>
                <span className="arrow-icon">→</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssessmentList; 