// Study-related facts for different detections
export const foodFacts = [
  {
    item: "snack",
    helpful: true,
    fact: "Light snacks like nuts or fruit can boost cognitive function. Keep portions small to avoid energy crashes!"
  },
  {
    item: "snack",
    helpful: false,
    fact: "High-sugar snacks cause energy spikes and crashes. Your focus may drop in 20-30 minutes."
  },
  {
    item: "energy drink",
    helpful: false,
    fact: "Energy drinks can temporarily boost alertness but may lead to jitters and reduced focus quality. Studies show they decrease retention by 15%."
  },
  {
    item: "energy drink",
    helpful: true,
    fact: "Caffeine takes 30-45 minutes to peak. Moderate amounts (80-100mg) can improve focus, but avoid consuming after 2 PM for better sleep."
  }
];

export const breakReminders = [
  "Time for a 5-minute break! Stand up, stretch, and look away from your screen. Your brain consolidates information during breaks.",
  "Break time! Try the 20-20-20 rule: Look at something 20 feet away for 20 seconds to reduce eye strain.",
  "Take a quick break! Walk around for 5 minutes. Physical movement increases blood flow to the brain and improves retention by 20%.",
  "Break reminder! Grab some water and do a few stretches. Hydration is crucial for cognitive performance.",
  "Time to pause! Close your eyes and take 5 deep breaths. This reduces cortisol and improves focus for the next session."
];

// Generate quiz questions based on subject
export function generateQuizQuestion(subject: string): { question: string; purpose: string } {
  const mathQuestions = [
    { question: "Can you explain the last concept you reviewed in your own words?", purpose: "Verbal recall strengthens neural pathways" },
    { question: "What's one real-world application of this math concept?", purpose: "Contextual learning improves retention by 40%" },
    { question: "If you had to teach this to a friend, what's the first thing you'd say?", purpose: "Teaching others is the most effective learning method" },
    { question: "What's the hardest part of this topic for you? Write it down.", purpose: "Identifying gaps helps targeted review" }
  ];

  const scienceQuestions = [
    { question: "Can you draw a diagram of what you just learned?", purpose: "Visual encoding creates multiple memory pathways" },
    { question: "How does this concept connect to something you learned before?", purpose: "Building connections strengthens memory networks" },
    { question: "What question would likely appear on a test about this?", purpose: "Anticipating questions improves test performance" },
    { question: "Explain the 'why' behind this concept, not just the 'what'", purpose: "Deep processing leads to better retention" }
  ];

  const historyQuestions = [
    { question: "What's the cause-and-effect relationship in what you're reading?", purpose: "Pattern recognition improves historical thinking" },
    { question: "How does this event relate to current events?", purpose: "Temporal connections make history memorable" },
    { question: "If you were there, what would you have done differently?", purpose: "Emotional engagement increases retention by 30%" },
    { question: "Can you create a timeline of the key events?", purpose: "Temporal organization aids recall" }
  ];

  const englishQuestions = [
    { question: "What's the main argument or theme you've identified so far?", purpose: "Synthesis improves comprehension" },
    { question: "Can you summarize the last page in one sentence?", purpose: "Compression exercises strengthen understanding" },
    { question: "What literary device did the author just use, and why?", purpose: "Critical analysis deepens engagement" },
    { question: "How does this text make you feel? Why?", purpose: "Emotional connections improve memory" }
  ];

  const defaultQuestions = [
    { question: "What's the most important thing you've learned in the last 10 minutes?", purpose: "Active recall is the #1 study technique" },
    { question: "Can you explain this concept without looking at your notes?", purpose: "Testing yourself is more effective than re-reading" },
    { question: "What's one thing that confused you? Let's clarify it.", purpose: "Identifying confusion points prevents false confidence" },
    { question: "How would you apply this knowledge in a practical situation?", purpose: "Application-based thinking improves transfer" }
  ];

  let questions = defaultQuestions;
  const subjectLower = subject.toLowerCase();

  if (subjectLower.includes('math') || subjectLower.includes('calculus') || subjectLower.includes('algebra')) {
    questions = mathQuestions;
  } else if (subjectLower.includes('science') || subjectLower.includes('physics') || 
             subjectLower.includes('chemistry') || subjectLower.includes('biology')) {
    questions = scienceQuestions;
  } else if (subjectLower.includes('history') || subjectLower.includes('social')) {
    questions = historyQuestions;
  } else if (subjectLower.includes('english') || subjectLower.includes('literature') || 
             subjectLower.includes('reading')) {
    questions = englishQuestions;
  }

  return questions[Math.floor(Math.random() * questions.length)];
}

export function getRandomFoodFact(item: "snack" | "energy drink"): string {
  const facts = foodFacts.filter(f => f.item === item);
  const fact = facts[Math.floor(Math.random() * facts.length)];
  return fact.fact;
}

export function getRandomBreakReminder(): string {
  return breakReminders[Math.floor(Math.random() * breakReminders.length)];
}
