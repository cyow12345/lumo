import { AssessmentTemplate } from '../models/Assessment';

export const assessments: AssessmentTemplate[] = [
  {
    id: 'communication-assessment',
    title: 'Kommunikations-Assessment',
    description: 'Bewerte die Kommunikation in deiner Beziehung und entdecke Stärken und Verbesserungspotenziale.',
    category: 'Kommunikation',
    questions: [
      {
        id: 'comm-1',
        text: 'Wie gut fühlst du dich von deinem Partner verstanden?',
        type: 'scale',
        required: true,
        category: 'Verständnis',
        scale: {
          min: 1,
          max: 5,
          minLabel: 'Sehr schlecht',
          maxLabel: 'Sehr gut'
        }
      },
      {
        id: 'comm-2',
        text: 'Wie oft sprecht ihr über eure Gefühle?',
        type: 'multipleChoice',
        required: true,
        category: 'Emotionale Kommunikation',
        options: [
          { id: 'comm-2-1', text: 'Täglich', value: 5 },
          { id: 'comm-2-2', text: 'Mehrmals pro Woche', value: 4 },
          { id: 'comm-2-3', text: 'Einmal pro Woche', value: 3 },
          { id: 'comm-2-4', text: 'Seltener als einmal pro Woche', value: 2 },
          { id: 'comm-2-5', text: 'Fast nie', value: 1 }
        ]
      },
      {
        id: 'comm-3',
        text: 'Welche Kommunikationskanäle nutzt ihr regelmäßig?',
        type: 'checkbox',
        category: 'Kommunikationskanäle',
        options: [
          { id: 'comm-3-1', text: 'Persönliche Gespräche', value: 5 },
          { id: 'comm-3-2', text: 'Videoanrufe', value: 4 },
          { id: 'comm-3-3', text: 'Telefonate', value: 4 },
          { id: 'comm-3-4', text: 'Textnachrichten', value: 3 },
          { id: 'comm-3-5', text: 'E-Mails', value: 2 }
        ]
      },
      {
        id: 'comm-4',
        text: 'Wie gut löst ihr Konflikte?',
        type: 'scale',
        required: true,
        category: 'Konfliktlösung',
        scale: {
          min: 1,
          max: 5,
          minLabel: 'Sehr schlecht',
          maxLabel: 'Sehr gut'
        }
      },
      {
        id: 'comm-5',
        text: 'Was würdest du gerne an eurer Kommunikation verbessern?',
        type: 'text',
        category: 'Verbesserungspotenzial'
      }
    ]
  },
  {
    id: 'relationship-assessment',
    title: '❤️ Beziehungsdynamik',
    description: 'Bewerte verschiedene Aspekte eurer Beziehung und entdecke Bereiche für Wachstum.',
    category: 'Beziehung',
    questions: [
      {
        id: 'hurt_response',
        text: 'Was tust du, wenn du dich durch eine Aussage verletzt fühlst?',
        type: 'multipleChoice',
        required: true,
        explanation: 'Diese Frage basiert auf dem Gottman-Konzept der "Vier apokalyptischen Reiter" in Beziehungen und hilft uns, destruktive Kommunikationsmuster zu erkennen.',
        category: 'Kommunikation',
        options: [
          { id: 'listen', text: 'Ich höre zu und teile meine Gefühle mit', value: 1 },
          { id: 'defensive', text: 'Ich werde defensiv und erkläre mich', value: 2 },
          { id: 'withdraw', text: 'Ich ziehe mich zurück', value: 3 },
          { id: 'emotional', text: 'Ich reagiere emotional', value: 4 }
        ]
      },
      {
        id: 'relationship_wish',
        text: 'Was ist dein größter Wunsch für eure Beziehung?',
        type: 'multipleChoice',
        required: true,
        explanation: 'Diese Frage basiert auf der Attachment Theory und hilft, Beziehungsziele zu verstehen.',
        category: 'Ziele',
        options: [
          { id: 'emotional_connection', text: 'Tiefere emotionale Verbindung', value: 1 },
          { id: 'better_communication', text: 'Bessere Kommunikation', value: 2 },
          { id: 'more_intimacy', text: 'Mehr Nähe und Intimität', value: 3 },
          { id: 'better_conflicts', text: 'Konflikte besser lösen', value: 4 },
          { id: 'growing_together', text: 'Gemeinsam wachsen', value: 5 }
        ]
      },
      {
        id: 'attachment_anxiety',
        text: 'Ich mache mir oft Sorgen, dass mein Partner mich verlassen könnte.',
        type: 'scale',
        required: true,
        explanation: 'Diese Einschätzung stammt aus dem Adult Attachment Interview (AAI) und gibt Aufschluss über Bindungsängste und Beziehungssicherheit.',
        category: 'Bindungsstil',
        scale: {
          min: 1,
          max: 5,
          minLabel: 'Trifft gar nicht zu',
          maxLabel: 'Trifft voll zu'
        }
      },
      {
        id: 'partner_alone_time',
        text: 'Wie fühlst du dich, wenn dein Partner mal einen Abend ohne dich verbringen möchte?',
        type: 'multipleChoice',
        required: true,
        explanation: 'Diese Frage basiert auf der Bindungstheorie nach Bowlby und Ainsworth und hilft, den Bindungsstil zu verstehen und sichere Bindung zu entwickeln.',
        category: 'Bindungsstil',
        options: [
          { id: 'happy', text: 'Ich freue mich, dass er/sie Spaß hat', value: 1 },
          { id: 'okay', text: 'Es ist okay, aber ich vermisse ihn/sie', value: 2 },
          { id: 'worried', text: 'Ich mache mir Sorgen oder fühle mich unsicher', value: 3 },
          { id: 'difficult', text: 'Es fällt mir sehr schwer, damit umzugehen', value: 4 }
        ]
      },
      {
        id: 'attachment_style',
        text: 'Was trifft eher auf dich zu?',
        type: 'multipleChoice',
        required: true,
        category: 'Bindungsstil',
        options: [
          { id: 'anxious', text: 'Ich brauche viel Nähe und Rückversicherung.', value: 1 },
          { id: 'avoidant', text: 'Ich schätze Unabhängigkeit in Beziehungen.', value: 2 }
        ]
      },
      {
        id: 'emotional_expression',
        text: 'Es fällt mir leicht, über meine Gefühle zu sprechen.',
        type: 'scale',
        required: true,
        category: 'Emotionale Ausdrucksfähigkeit',
        scale: {
          min: 1,
          max: 5,
          minLabel: 'Trifft gar nicht zu',
          maxLabel: 'Trifft voll zu'
        }
      },
      {
        id: 'love_language',
        text: 'Wie zeigst du am liebsten deine Zuneigung? (Wähle alle zutreffenden)',
        type: 'checkbox',
        required: true,
        category: 'Liebessprache',
        options: [
          { id: 'words', text: 'Durch liebevolle Worte', value: 1 },
          { id: 'time', text: 'Durch gemeinsame Zeit', value: 2 },
          { id: 'gifts', text: 'Durch Geschenke', value: 3 },
          { id: 'service', text: 'Durch Hilfsbereitschaft', value: 4 },
          { id: 'touch', text: 'Durch körperliche Nähe', value: 5 }
        ]
      }
    ]
  }
];

export function getAllAssessments(): AssessmentTemplate[] {
  return assessments;
}

export function getAssessmentById(id: string): AssessmentTemplate | null {
  return assessments.find(assessment => assessment.id === id) || null;
}

export function getAssessmentsByCategory(category: string): AssessmentTemplate[] {
  return assessments.filter(assessment => assessment.category === category);
} 