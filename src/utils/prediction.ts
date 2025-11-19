import { SessionData } from "../components/OnboardingChat";

export interface PredictionResult {
  probability: number;
  confidence: number;
  factors: {
    studyTime: number;
    priorKnowledge: number;
    interest: number;
    subject: number;
  };
  recommendations: string[];
  suggestedDuration?: number;
}

export function calculateSuccessPrediction(sessionData: SessionData): PredictionResult {
  const hours = sessionData.duration / 60;
  
  // Subject difficulty mapping
  const subjectDifficulty: { [key: string]: number } = {
    math: 0.85,
    calculus: 0.85,
    physics: 0.80,
    chemistry: 0.80,
    biology: 0.75,
    history: 0.70,
    english: 0.75,
    programming: 0.85,
    cs: 0.85,
    computer: 0.85
  };
  
  const subjectKey = Object.keys(subjectDifficulty).find(key => 
    sessionData.reason.toLowerCase().includes(key) || 
    sessionData.category.toLowerCase().includes(key)
  );
  const subjectFactor = subjectKey ? subjectDifficulty[subjectKey] : 0.75;

  // Logistic regression simulation
  const knowledgeFactor = sessionData.priorKnowledge / 10;
  const interestFactor = sessionData.interest / 10;
  const timeFactor = Math.min(hours / 2.5, 1); // Optimal around 2.5 hours

  // Weighted prediction
  const rawScore = (
    knowledgeFactor * 0.35 +
    interestFactor * 0.25 +
    timeFactor * 0.25 +
    subjectFactor * 0.15
  );

  const probability = Math.round(Math.min(rawScore * 100, 95));
  const confidence = Math.round(70 + Math.random() * 20);

  // Generate recommendations
  const recommendations: string[] = [];
  let suggestedDuration: number | undefined;
  
  if (probability < 70) {
    // Calculate how much more time they need
    const targetScore = 0.75; // Target 75% success
    const currentTimeContribution = timeFactor * 0.25;
    const neededTimeContribution = (targetScore - (rawScore - currentTimeContribution)) * 0.25;
    const neededTimeFactor = neededTimeContribution / 0.25;
    suggestedDuration = Math.ceil(neededTimeFactor * 2.5 * 60); // Convert to minutes
    
    // Removed the probability suggestion text
  }
  
  if (hours < 1.5) {
    recommendations.push("Studies show that 1.5-2.5 hours is optimal for retention and comprehension.");
  }
  
  if (sessionData.priorKnowledge < 5) {
    recommendations.push("Since your prior knowledge is low, consider reviewing fundamental concepts before diving into advanced topics.");
  }
  
  if (sessionData.interest < 6) {
    recommendations.push("Low interest can impact retention. Try finding real-world applications or study with a group to boost engagement.");
  }
  
  if (hours > 3) {
    recommendations.push("Sessions over 3 hours show diminishing returns. Break it into 30-minute blocks with 5-minute breaks.");
  }
  
  if (probability >= 80) {
    recommendations.push("Excellent setup! Your predicted success rate is high. Stay focused and you'll do great!");
  }
  
  if (probability >= 70 && probability < 80) {
    recommendations.push("Good setup! You're on track for success. Consider taking short breaks every 30 minutes.");
  }

  return {
    probability,
    confidence,
    factors: {
      studyTime: timeFactor * 100,
      priorKnowledge: knowledgeFactor * 100,
      interest: interestFactor * 100,
      subject: subjectFactor * 100
    },
    recommendations: recommendations.slice(0, 3),
    suggestedDuration
  };
}