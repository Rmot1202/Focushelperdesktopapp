import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Pause, Play, FileText, X } from "lucide-react";
import { SessionData } from "./OnboardingChat";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { NotificationDialog } from "./NotificationDialog";
import { getRandomFoodFact, getRandomBreakReminder, generateQuizQuestion } from "../utils/studyFacts";
import { toast } from "sonner@2.0.3";

interface ActiveSessionProps {
  sessionData: SessionData;
  onEnd: (sessionStats: SessionStats) => void;
}

export interface SessionStats {
  duration: number;
  avgFocus: number;
  energyDrinks: number;
  snacks: number;
}

export function ActiveSession({ sessionData, onEnd }: ActiveSessionProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [focusScore, setFocusScore] = useState(83);
  const [currentStatus, setCurrentStatus] = useState("Watching screen");
  const [eatingStatus, setEatingStatus] = useState("None detected");
  const [events, setEvents] = useState([
    { time: "00:00", text: "Session started" }
  ]);
  const [energyDrinks, setEnergyDrinks] = useState(0);
  const [snacks, setSnacks] = useState(0);
  
  // Notification state
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationType, setNotificationType] = useState<"break" | "food" | "drink" | "quiz">("break");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [quizQuestion, setQuizQuestion] = useState<{ question: string; purpose: string } | undefined>();
  
  // Tracking for notifications
  const [lastBreakTime, setLastBreakTime] = useState(0);
  const [lastQuizTime, setLastQuizTime] = useState(0);

  // Mock focus data for chart
  const [focusData, setFocusData] = useState([
    { time: 0, focus: 85 },
    { time: 5, focus: 82 },
    { time: 10, focus: 88 },
    { time: 15, focus: 79 },
    { time: 20, focus: 83 },
  ]);

  const showNotification = (type: "break" | "food" | "drink" | "quiz", message: string, quiz?: { question: string; purpose: string }) => {
    setNotificationType(type);
    setNotificationMessage(message);
    setQuizQuestion(quiz);
    setNotificationOpen(true);
    
    // Also show a toast for quick visibility
    toast.info(type === "quiz" ? "Focus check!" : type === "break" ? "Break time!" : "Detection alert", {
      description: message.slice(0, 60) + "..."
    });
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setElapsed(e => {
        const newElapsed = e + 1;
        
        // Break reminders every 25 minutes (1500 seconds)
        if (newElapsed > 0 && newElapsed % 1500 === 0 && newElapsed !== lastBreakTime) {
          setLastBreakTime(newElapsed);
          const breakMessage = getRandomBreakReminder();
          showNotification("break", breakMessage);
        }
        
        // Quiz questions every 8-12 minutes
        const quizInterval = 480 + Math.floor(Math.random() * 240); // 8-12 minutes
        if (newElapsed > 0 && newElapsed - lastQuizTime >= quizInterval && newElapsed - lastQuizTime < quizInterval + 2) {
          setLastQuizTime(newElapsed);
          const quiz = generateQuizQuestion(sessionData.reason);
          showNotification("quiz", "Let's do a quick focus check to reinforce what you're learning!", quiz);
        }
        
        return newElapsed;
      });
      
      // Simulate focus changes
      if (Math.random() > 0.95) {
        const newFocus = Math.floor(75 + Math.random() * 20);
        setFocusScore(newFocus);
        
        if (newFocus < 80) {
          setCurrentStatus("Looking away");
          const timestamp = formatTime(elapsed);
          setEvents(prev => [...prev, { time: timestamp, text: "Focus dipped (looking away)" }]);
        } else {
          setCurrentStatus("Watching screen");
        }
      }

      // Simulate rare detections with notifications
      if (Math.random() > 0.998) {
        const detection = Math.random() > 0.5 ? "energy drink" : "snack";
        if (detection === "energy drink") {
          setEnergyDrinks(prev => prev + 1);
          setEatingStatus("Energy drink detected");
          const fact = getRandomFoodFact("energy drink");
          showNotification("drink", fact);
        } else {
          setSnacks(prev => prev + 1);
          setEatingStatus("Snack detected");
          const fact = getRandomFoodFact("snack");
          showNotification("food", fact);
        }
        const timestamp = formatTime(elapsed);
        setEvents(prev => [...prev, { time: timestamp, text: `${detection === "energy drink" ? "Energy drink" : "Snack"} detected` }]);
        
        setTimeout(() => setEatingStatus("None detected"), 3000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, elapsed, lastBreakTime, lastQuizTime, sessionData.reason]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const remaining = sessionData.duration * 60 - elapsed;
  const breakIn = 1800 - (elapsed % 1800); // 30 min breaks

  const handleEnd = () => {
    onEnd({
      duration: elapsed / 60,
      avgFocus: focusScore,
      energyDrinks,
      snacks
    });
  };

  return (
    <div className="flex-1 overflow-auto relative">
      <NotificationDialog
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        type={notificationType}
        message={notificationMessage}
        quizQuestion={quizQuestion}
      />

      {/* Corner Vision Display - Zoom Style */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="w-48 h-36 bg-[#2C4A52] rounded-lg border-2 border-[#7EC4B6]/30 overflow-hidden shadow-2xl">
          <div className="relative w-full h-full">
            {/* Camera indicator */}
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
            
            {/* Mock camera feed */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1f3740] to-[#2C4A52]">
              <div className="text-center">
                <div className="w-16 h-16 border-2 border-[#7EC4B6]/40 rounded-full mx-auto mb-2"></div>
                <p className="text-xs text-[#A8DCD1]/60">Camera Feed</p>
              </div>
            </div>

            {/* Status overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <div className={`text-xs px-2 py-1 rounded inline-block ${
                currentStatus === "Watching screen" 
                  ? "bg-[#7EC4B6]/20 text-[#7EC4B6]" 
                  : "bg-yellow-500/20 text-yellow-400"
              }`}>
                {currentStatus === "Watching screen" ? "👁️ Focused" : "👀 Distracted"}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl text-white mb-1">Focus Session – {sessionData.reason}</h2>
            <p className="text-zinc-400">
              Ends in {formatTime(remaining)} {sessionData.testDate && `• Test at ${sessionData.testTime || '3:00 PM'}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Tracking:</span>
            <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Active
            </div>
          </div>
        </div>

        {/* Main Content - 3 Columns */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Left - Video Feed */}
          <div className="col-span-6">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-white mb-4">Camera & Detection</h3>
              
              {/* Mock Video Feed */}
              <div className="aspect-video bg-zinc-800 rounded-lg mb-4 relative overflow-hidden">
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Camera on
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                  <div className="text-center">
                    <div className="w-24 h-24 border-4 border-zinc-700 rounded-full mx-auto mb-3"></div>
                    <p className="text-sm">Live camera feed</p>
                  </div>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex gap-2 mb-3">
                <div className={`px-3 py-1 rounded-full text-sm ${
                  currentStatus === "Watching screen" 
                    ? "bg-green-500/10 text-green-500" 
                    : "bg-yellow-500/10 text-yellow-500"
                }`}>
                  Focus: {currentStatus}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  eatingStatus === "None detected"
                    ? "bg-zinc-800 text-zinc-400"
                    : "bg-orange-500/10 text-orange-500"
                }`}>
                  Eating: {eatingStatus}
                </div>
              </div>

              <p className="text-xs text-zinc-500">
                If you're not in view or eyes closed for 20+ minutes, I'll end the session automatically.
              </p>
            </Card>
          </div>

          {/* Middle - Focus Metrics */}
          <div className="col-span-3 space-y-6">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-white mb-4">Focus Score</h3>
              <div className="text-5xl text-white mb-2">{focusScore}</div>
              <p className="text-zinc-400 mb-4">Average focus this session</p>
              
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={focusData}>
                    <Line type="monotone" dataKey="focus" stroke="#10b981" strokeWidth={2} dot={false} />
                    <XAxis dataKey="time" stroke="#71717a" fontSize={10} />
                    <YAxis domain={[0, 100]} stroke="#71717a" fontSize={10} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-white mb-4">Session Timers</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-zinc-400 text-sm">Elapsed</p>
                  <p className="text-white text-xl">{formatTime(elapsed)}</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Remaining</p>
                  <p className="text-white text-xl">{formatTime(remaining)}</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Break recommended in</p>
                  <p className="text-white text-xl">{formatTime(breakIn)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right - Events & Detections */}
          <div className="col-span-3 space-y-6">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-white mb-4">Live Events</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {events.slice().reverse().map((event, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="text-zinc-500">{event.time}</span>
                    <span className="text-zinc-300 ml-2">– {event.text}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-white mb-4">Detections</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Energy Drinks:</span>
                  <span className="text-white">{energyDrinks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Snacks:</span>
                  <span className="text-white">{snacks}</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-4">
                We only count when objects appear for more than 5 seconds.
              </p>
            </Card>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-sm text-zinc-400">
            Session reason: {sessionData.reason}
          </p>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="border-zinc-700"
            >
              {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button variant="outline" size="sm" className="border-zinc-700">
              <FileText className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>

          <Button variant="destructive" size="sm" onClick={handleEnd}>
            <X className="w-4 h-4 mr-2" />
            End Session
          </Button>
        </div>
      </div>
    </div>
  );
}