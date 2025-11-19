import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Slider } from "./ui/slider";
import { SessionData } from "./OnboardingChat";
import { calculateSuccessPrediction, PredictionResult } from "../utils/prediction";
import { Brain, TrendingUp, AlertCircle, Clock, Presentation, Lightbulb, LineChart } from "lucide-react";

interface SessionSetupProps {
  initialData: SessionData;
  onStart: (data: SessionData) => void;
  onBack: () => void;
}

export function SessionSetup({ initialData, onStart, onBack }: SessionSetupProps) {
  const [formData, setFormData] = useState(initialData);
  const [cameraTracking, setCameraTracking] = useState(true);
  const [yoloTracking, setYoloTracking] = useState(true);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  useEffect(() => {
    const result = calculateSuccessPrediction(formData);
    setPrediction(result);
  }, [formData]);

  const applySuggestion = () => {
    if (prediction?.suggestedDuration) {
      setFormData({ ...formData, duration: prediction.suggestedDuration });
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-2xl text-white mb-1">Session Setup</h2>
              <p className="text-zinc-400">
                We pre-filled this based on our chat. Adjust anything you need.
              </p>
            </div>
            <span className="text-xs text-zinc-500">Session ID: #A1B2C3</span>
          </div>
        </div>

        {/* AI Prediction Card */}
        {prediction && prediction.probability < 70 ? (
          // LOW PREDICTION - Show Feature Recommendations
          <Card className="p-6 mb-8 border-2 bg-[#7EC4B6]/5 border-[#7EC4B6]/30">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-lg bg-[#7EC4B6]/10">
                <Lightbulb className="w-8 h-8 text-[#7EC4B6]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white mb-2">Boost Your Success with FocusFrame Features</h3>
                <p className="text-zinc-300 mb-4">
                  Based on your current setup, we recommend using these features to maximize your study effectiveness:
                </p>

                {/* Feature Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Slide Generator */}
                  <div className="bg-[#2C4A52] border border-[#7EC4B6]/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Presentation className="w-6 h-6 text-[#7EC4B6] flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-white mb-1">Slides Generator</h4>
                        <p className="text-sm text-zinc-400 mb-3">
                          Transform your notes into professional study slides with AI-powered prompts for Gamma AI.
                        </p>
                        <p className="text-xs text-[#7EC4B6]">
                          Perfect for visual learners and test prep
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="bg-[#2C4A52] border border-[#7EC4B6]/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <LineChart className="w-6 h-6 text-[#7EC4B6] flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-white mb-1">Analytics Dashboard</h4>
                        <p className="text-sm text-zinc-400 mb-3">
                          Track your study patterns and progress over time with detailed insights.
                        </p>
                        <p className="text-xs text-[#7EC4B6]">
                          View after completing sessions
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Smart Notifications */}
                  <div className="bg-[#2C4A52] border border-[#7EC4B6]/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-[#7EC4B6] flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-white mb-1">Smart Notifications</h4>
                        <p className="text-sm text-zinc-400 mb-3">
                          Break reminders, quiz questions, and educational facts to keep you engaged and learning.
                        </p>
                        <p className="text-xs text-[#7EC4B6]">
                          Automatic during sessions
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Camera Tracking */}
                  <div className="bg-[#2C4A52] border border-[#7EC4B6]/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Brain className="w-6 h-6 text-[#7EC4B6] flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-white mb-1">YOLO Detection</h4>
                        <p className="text-sm text-zinc-400 mb-3">
                          Monitor consumption patterns with object detection to track energy drinks and snacks.
                        </p>
                        <p className="text-xs text-[#7EC4B6]">
                          Enabled below in Tracking settings
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {prediction.recommendations.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-[#7EC4B6]/20 pt-4">
                <p className="text-sm text-zinc-400 mb-2">Quick tips to improve your session:</p>
                {prediction.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-2 text-sm text-zinc-300">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#7EC4B6]" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : prediction && prediction.probability >= 70 ? (
          // GOOD PREDICTION - Simple card without percentage
          <Card className="p-6 mb-8 border-2 bg-[#7EC4B6]/5 border-[#7EC4B6]/30">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#7EC4B6]/10">
                <Brain className="w-8 h-8 text-[#7EC4B6]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white mb-1">You're all set for a successful session! 🎯</h3>
                <p className="text-zinc-300">
                  Your setup looks great. Start your focus session when you're ready.
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="reason" className="text-white mb-2 block">
                Reason for studying
              </Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-white mb-2 block">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Test">Test</SelectItem>
                  <SelectItem value="Homework">Homework</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="Reading">Reading</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration" className="text-white mb-2 block">
                Planned study duration
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <span className="text-zinc-400">minutes</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {formData.category === "Test" && (
              <>
                <div>
                  <Label htmlFor="testDate" className="text-white mb-2 block">
                    Test date
                  </Label>
                  <Input
                    id="testDate"
                    type="date"
                    value={formData.testDate}
                    onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="testTime" className="text-white mb-2 block">
                    Test time
                  </Label>
                  <Input
                    id="testTime"
                    type="time"
                    value={formData.testTime}
                    onChange={(e) => setFormData({ ...formData, testTime: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white mb-3 block">Reminders</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remind1" defaultChecked className="border-zinc-700" />
                      <label htmlFor="remind1" className="text-sm text-zinc-300">
                        Remind me 1 hour before test
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remind2" defaultChecked className="border-zinc-700" />
                      <label htmlFor="remind2" className="text-sm text-zinc-300">
                        Remind me 10 minutes before test
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Prior Knowledge & Interest - Always show */}
            <div>
              <Label htmlFor="priorKnowledge" className="text-white mb-2 block">
                Prior Knowledge Level
              </Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[formData.priorKnowledge]}
                  onValueChange={([value]) => setFormData({ ...formData, priorKnowledge: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <span className="text-white w-12 text-right">{formData.priorKnowledge}/10</span>
              </div>
            </div>

            <div>
              <Label htmlFor="interest" className="text-white mb-2 block">
                Interest Level
              </Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[formData.interest]}
                  onValueChange={([value]) => setFormData({ ...formData, interest: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <span className="text-white w-12 text-right">{formData.interest}/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Card */}
        <Card className="p-6 bg-zinc-900 border-zinc-800 mb-8">
          <h3 className="text-white mb-4">Tracking</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Use camera for focus tracking (MediaPipe)</p>
                <p className="text-sm text-zinc-500">Track eye gaze and attention</p>
              </div>
              <Checkbox checked={cameraTracking} onCheckedChange={(checked) => setCameraTracking(!!checked)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Detect binge eating / energy drinks (YOLO)</p>
                <p className="text-sm text-zinc-500">Monitor consumption patterns</p>
              </div>
              <Checkbox checked={yoloTracking} onCheckedChange={(checked) => setYoloTracking(!!checked)} />
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-4">
            We only process this locally and save anonymized session stats.
          </p>
        </Card>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onBack} className="border-zinc-700">
            Back to chat
          </Button>
          <Button onClick={() => onStart(formData)}>Start focus session</Button>
        </div>
      </div>
    </div>
  );
}