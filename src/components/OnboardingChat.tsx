import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Slider } from "./ui/slider";

interface OnboardingChatProps {
  onComplete: (data: SessionData) => void;
}

export interface SessionData {
  reason: string;
  category: string;
  testDate?: string;
  testTime?: string;
  duration: number;
  priorKnowledge: number;
  interest: number;
}

export function OnboardingChat({ onComplete }: OnboardingChatProps) {
  const [step, setStep] = useState(0);
  const [sessionData, setSessionData] = useState<Partial<SessionData>>({});
  const [userInput, setUserInput] = useState("");
  
  const chatSteps = [
    {
      system: "Hey! What are you working on right now?",
      chips: ["Test", "Homework", "Project", "Reading"],
      field: "category"
    },
    {
      system: "Great! Can you tell me more details about it?",
      placeholder: "e.g., CS midterm - Chapters 5-8",
      field: "reason"
    },
    {
      system: "When is this test?",
      placeholder: "e.g., Tomorrow at 3 PM",
      field: "testDate",
      skipCondition: (data: Partial<SessionData>) => data.category !== "Test"
    },
    {
      system: "How long do you want to study right now?",
      placeholder: "e.g., 90 minutes",
      field: "duration"
    },
    {
      system: "On a scale of 1-10, what's your current knowledge level on this topic?",
      subtext: "1 = Never seen it before, 10 = I could teach it",
      field: "priorKnowledge",
      slider: true
    },
    {
      system: "How interested are you in this subject?",
      subtext: "1 = Not interested, 10 = Love it",
      field: "interest",
      slider: true
    }
  ];

  const currentStep = chatSteps[step];

  const handleChipClick = (value: string) => {
    const newData = { ...sessionData, [currentStep.field]: value };
    setSessionData(newData);
    
    setTimeout(() => {
      moveToNextStep(newData);
    }, 300);
  };

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    
    const newData = { ...sessionData, [currentStep.field]: userInput };
    setSessionData(newData);
    setUserInput("");
    
    setTimeout(() => {
      moveToNextStep(newData);
    }, 300);
  };

  const handleSliderComplete = (value: number) => {
    const newData = { ...sessionData, [currentStep.field]: value };
    setSessionData(newData);
    
    setTimeout(() => {
      moveToNextStep(newData);
    }, 500);
  };

  const moveToNextStep = (data: Partial<SessionData>) => {
    let nextStep = step + 1;
    
    // Skip test date if not a test
    while (nextStep < chatSteps.length && chatSteps[nextStep].skipCondition?.(data)) {
      nextStep++;
    }
    
    if (nextStep >= chatSteps.length) {
      // Parse duration
      const durationMatch = String(data.duration).match(/(\d+)/);
      const duration = durationMatch ? parseInt(durationMatch[1]) : 90;
      
      onComplete({
        reason: data.reason || "Study session",
        category: data.category || "Other",
        testDate: data.testDate,
        duration: duration,
        priorKnowledge: data.priorKnowledge || 6,
        interest: data.interest || 7
      });
    } else {
      setStep(nextStep);
    }
  };

  const getSummary = () => {
    if (step < 2) return null;
    
    return (
      <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
        <p className="text-sm text-zinc-400 mb-2">Session preview:</p>
        <ul className="text-sm text-zinc-300 space-y-1">
          {sessionData.category && <li>• Category: {sessionData.category}</li>}
          {sessionData.reason && <li>• Reason: {sessionData.reason}</li>}
          {sessionData.testDate && <li>• Test: {sessionData.testDate}</li>}
          {sessionData.duration && <li>• Duration: {sessionData.duration} minutes</li>}
          {sessionData.priorKnowledge && <li>• Knowledge level: {sessionData.priorKnowledge}/10</li>}
          {sessionData.interest && <li>• Interest level: {sessionData.interest}/10</li>}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl p-8 bg-zinc-900 border-zinc-800">
        <div className="mb-8">
          <h2 className="text-2xl text-white mb-2">Welcome back, Raven 👋</h2>
          <p className="text-zinc-400">Let's set up your next focus session.</p>
        </div>

        <div className="space-y-4 mb-6">
          {/* System message */}
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-lg px-4 py-3 max-w-md">
              <p className="text-white">{currentStep.system}</p>
            </div>
          </div>

          {/* Chip options */}
          {currentStep.chips && (
            <div className="flex gap-2 flex-wrap">
              {currentStep.chips.map((chip) => (
                <Button
                  key={chip}
                  variant="outline"
                  size="sm"
                  onClick={() => handleChipClick(chip)}
                  className="border-zinc-700 hover:bg-zinc-800"
                >
                  {chip}
                </Button>
              ))}
            </div>
          )}

          {/* Slider input */}
          {currentStep.slider && (
            <div className="mt-4">
              {currentStep.subtext && (
                <p className="text-sm text-zinc-400 mb-4">{currentStep.subtext}</p>
              )}
              <div className="mb-6">
                <div className="text-center mb-4">
                  <span className="text-4xl text-white">
                    {sessionData[currentStep.field as keyof SessionData] || 5}
                  </span>
                  <span className="text-xl text-zinc-400"> / 10</span>
                </div>
                <Slider
                  value={[Number(sessionData[currentStep.field as keyof SessionData]) || 5]}
                  onValueChange={([value]) => setSessionData({ ...sessionData, [currentStep.field]: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-zinc-500">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
              </div>
              <Button 
                onClick={() => handleSliderComplete(Number(sessionData[currentStep.field as keyof SessionData]) || 5)}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Text input */}
          {!currentStep.chips && !currentStep.slider && (
            <div className="flex gap-2">
              <Input
                placeholder={currentStep.placeholder}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Button onClick={handleSubmit}>Send</Button>
            </div>
          )}
        </div>

        {getSummary()}
      </Card>
    </div>
  );
}
