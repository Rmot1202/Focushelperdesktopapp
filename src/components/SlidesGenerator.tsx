import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Copy, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const PROMPT_TEMPLATES = {
  custom: {
    name: "Custom Notes",
    description: "Generate from your own notes"
  },
  aiPredictor: {
    name: "AI Study Success Predictor",
    description: "Present the AI prediction system",
    notes: `# AI-Powered Study Success Predictor

## Problem Statement
Students struggle to know if their study time will be effective enough to pass upcoming tests.

## Solution Overview
An AI-driven prediction system that asks 4 simple questions and predicts success probability.

## The Four Questions
1. What subject are you studying?
2. How much time do you plan to study?
3. What's your prior knowledge level? (1-10)
4. How interested are you in this topic? (1-10)

## How It Works
• Natural Language Processing reads user responses
• Converts qualitative answers to numerical features
• Subject → Category encoding
• Study time → Hours (numeric)
• Prior knowledge → Scale 1-10
• Interest level → Scale 1-10

## The Prediction Engine
Uses logistic regression trained on historical study session data:
• Input: 4 features (subject, time, knowledge, interest)
• Output: Probability of success (0-100%)
• Updates model as more data is collected

## Example Workflow
User: "I'm studying calculus for 2 hours, I'd rate my knowledge at 6/10 and interest at 7/10"
System: Extracts → {subject: "math", hours: 2, knowledge: 6, interest: 7}
Model: Predicts → 78% probability of success

## Real-Time Tracking Integration
• MediaPipe tracks actual focus during study
• YOLO detects distractions (food, drinks)
• Compares predicted vs actual performance
• Improves model accuracy over time

## Personalization
• Model learns individual study patterns
• Adjusts predictions based on historical accuracy
• Identifies optimal study duration per subject
• Recommends break timing

## Future Improvements
• Add circadian rhythm analysis
• Integrate calendar for deadline urgency
• Social accountability features
• Spaced repetition recommendations`,
    prompt: `Create a slide deck explaining an AI-driven study success prediction system.

The system uses a natural-language interface to ask users four questions:
1. Subject they're studying
2. Planned study time
3. Previous knowledge level (1-10)
4. Interest level (1-10)

The answers are converted into numerical features using NLP, and after enough data is collected, a logistic regression model predicts the user's probability of success on an upcoming quiz or test.

Include slides covering:
• Problem the tool solves
• How the AI interviewer works
• Feature extraction using NLP
• Logistic regression prediction engine
• Example workflow with sample data
• Real-time tracking integration (MediaPipe focus + YOLO distraction detection)
• Future improvements and personalization

Use a modern, clean design with a dark theme suitable for desktop presentations.`
  },
  focusMetrics: {
    name: "Focus Tracking Research",
    description: "Present MediaPipe & YOLO research findings",
    notes: `# Focus Tracking Technology

## MediaPipe Overview
• Real-time eye gaze tracking
• Head pose estimation
• Attention detection algorithms
• Local processing (privacy-first)

## YOLO Object Detection
• Real-time object recognition
• Detects food and beverages
• Correlates consumption with focus drops
• 5-second threshold to avoid false positives

## Research Findings
• Average focus score: 78/100
• Focus drops 15% after energy drink consumption
• Optimal study blocks: 25-30 minutes
• Break timing critical for sustained attention

## Data Privacy
• All processing happens locally
• No video stored on servers
• Only anonymized metrics saved
• User has full control over camera`,
    prompt: `Create slides about focus tracking technology for studying, covering MediaPipe eye gaze tracking, YOLO object detection for distractions, research findings on focus patterns, and privacy-first approach.`
  }
};

export function SlidesGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof PROMPT_TEMPLATES>("custom");
  const [notes, setNotes] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(0);

  const loadTemplate = (template: keyof typeof PROMPT_TEMPLATES) => {
    setSelectedTemplate(template);
    if (template !== "custom" && PROMPT_TEMPLATES[template].notes) {
      setNotes(PROMPT_TEMPLATES[template].notes);
      // Auto-generate for templates
      setTimeout(() => generatePrompt(PROMPT_TEMPLATES[template].notes, template), 100);
    } else {
      setNotes("");
      setGeneratedPrompt("");
      setEstimatedTime(0);
    }
  };

  const generatePrompt = (notesText?: string, template?: keyof typeof PROMPT_TEMPLATES) => {
    const textToUse = notesText || notes;
    const templateToUse = template || selectedTemplate;
    
    if (!textToUse || typeof textToUse !== 'string' || !textToUse.trim()) {
      toast.error("Please enter some notes first");
      return;
    }

    // Count approximate slides (one per paragraph or bullet section)
    const slideCount = Math.max(10, Math.min(15, textToUse.split('\n\n').length + 5));
    const timePerSlide = 3; // minutes
    const savedTime = (slideCount * timePerSlide) / 60; // in hours

    let prompt = "";
    
    if (templateToUse !== "custom" && PROMPT_TEMPLATES[templateToUse].prompt) {
      prompt = PROMPT_TEMPLATES[templateToUse].prompt;
    } else {
      prompt = `Create a concise, visually clean slide deck for studying.

Use the following notes as content:
• Focus on key definitions and example problems
• Limit to ${slideCount} slides
• Use a dark theme suitable for desktop viewing

Notes:
${textToUse}`;
    }

    setGeneratedPrompt(prompt);
    setEstimatedTime(parseFloat(savedTime.toFixed(1)));
    toast.success("Prompt generated!");
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-2xl text-white mb-2">Slide Generator</h2>
          <p className="text-zinc-400">
            Turn raw notes into clean slides and track how much time you save.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left - Notes Input */}
          <div>
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white">Your Notes</h3>
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>

              {/* Template Selector */}
              <div className="mb-4">
                <label className="text-sm text-zinc-400 mb-2 block">Quick Start Templates</label>
                <Select value={selectedTemplate} onValueChange={(value) => loadTemplate(value as keyof typeof PROMPT_TEMPLATES)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROMPT_TEMPLATES).map(([key, template]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-zinc-500">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Tabs defaultValue="paste" className="mb-4">
                <TabsList className="bg-zinc-800">
                  <TabsTrigger value="paste">Paste text</TabsTrigger>
                  <TabsTrigger value="upload">Upload file</TabsTrigger>
                  <TabsTrigger value="scan" disabled>
                    Scan handwriting (coming soon)
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="paste" className="mt-4">
                  <Textarea
                    placeholder="Paste your bullet points, lecture notes, or outline here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-80 bg-zinc-800 border-zinc-700 text-white"
                  />
                </TabsContent>
                
                <TabsContent value="upload" className="mt-4">
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-12 text-center">
                    <p className="text-zinc-400 mb-4">Drag and drop a file here</p>
                    <Button variant="outline" className="border-zinc-700">
                      Choose File
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <p className="text-xs text-zinc-500">
                We'll generate a Gamma prompt from this. You can edit it before sending.
              </p>

              <Button onClick={generatePrompt} className="mt-4 w-full">
                Generate Prompt
              </Button>
            </Card>
          </div>

          {/* Right - Generated Prompt & Time Saved */}
          <div className="space-y-6">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-white mb-4">Gamma Prompt</h3>
              
              {generatedPrompt ? (
                <>
                  <Textarea
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    className="min-h-60 bg-zinc-800 border-zinc-700 text-white mb-4"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={copyPrompt}
                      className="border-zinc-700 flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy prompt
                    </Button>
                    <Button
                      onClick={() => window.open('https://gamma.app', '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in Gamma
                    </Button>
                  </div>
                </>
              ) : (
                <div className="min-h-60 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center">
                  <p className="text-zinc-500">Enter notes and generate a prompt</p>
                </div>
              )}
            </Card>

            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-white mb-4">Time Saved</h3>
              
              {estimatedTime > 0 ? (
                <>
                  <div className="text-4xl text-green-500 mb-2">
                    {estimatedTime} hours
                  </div>
                  <p className="text-zinc-400 mb-4">
                    Based on average 3 minutes per slide if done manually.
                  </p>
                </>
              ) : (
                <p className="text-zinc-500 mb-4">
                  Generate a prompt to see estimated time saved
                </p>
              )}
              
              <Button variant="link" className="text-blue-400 p-0 h-auto">
                View all slide sessions →
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}