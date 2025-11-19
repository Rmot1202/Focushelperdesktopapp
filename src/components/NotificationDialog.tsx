import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Coffee, Cookie, Clock, Brain, CheckCircle } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useState } from "react";

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
  type: "break" | "food" | "drink" | "quiz";
  message: string;
  quizQuestion?: { question: string; purpose: string };
}

export function NotificationDialog({ 
  open, 
  onClose, 
  type, 
  message,
  quizQuestion 
}: NotificationDialogProps) {
  const [quizAnswer, setQuizAnswer] = useState("");
  const [showPurpose, setShowPurpose] = useState(false);

  const handleQuizSubmit = () => {
    setShowPurpose(true);
    setTimeout(() => {
      onClose();
      setQuizAnswer("");
      setShowPurpose(false);
    }, 3000);
  };

  const getIcon = () => {
    switch (type) {
      case "break":
        return <Clock className="w-12 h-12 text-blue-400" />;
      case "food":
        return <Cookie className="w-12 h-12 text-orange-400" />;
      case "drink":
        return <Coffee className="w-12 h-12 text-purple-400" />;
      case "quiz":
        return <Brain className="w-12 h-12 text-green-400" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "break":
        return "Break Time! 🎯";
      case "food":
        return "Snack Detected 🍪";
      case "drink":
        return "Drink Detected ☕";
      case "quiz":
        return "Focus Check! 🧠";
    }
  };

  const getColor = () => {
    switch (type) {
      case "break":
        return "border-blue-500/30 bg-blue-900/10";
      case "food":
        return "border-orange-500/30 bg-orange-900/10";
      case "drink":
        return "border-purple-500/30 bg-purple-900/10";
      case "quiz":
        return "border-green-500/30 bg-green-900/10";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`bg-zinc-900 border-2 ${getColor()}`}>
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className={`p-3 rounded-lg ${
              type === "break" ? "bg-blue-500/10" :
              type === "food" ? "bg-orange-500/10" :
              type === "drink" ? "bg-purple-500/10" :
              "bg-green-500/10"
            }`}>
              {getIcon()}
            </div>
            <DialogTitle className="text-2xl">{getTitle()}</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-300 text-base pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        {type === "quiz" && quizQuestion && (
          <div className="space-y-4 py-4">
            <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
              <p className="text-white mb-3">{quizQuestion.question}</p>
              <Textarea
                placeholder="Type your answer here..."
                value={quizAnswer}
                onChange={(e) => setQuizAnswer(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white min-h-24"
              />
            </div>

            {showPurpose && (
              <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-400 mb-1">Great job! 🎉</p>
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-400">Why this matters:</span> {quizQuestion.purpose}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {type === "quiz" && !showPurpose ? (
            <>
              <Button variant="outline" onClick={onClose} className="border-zinc-700">
                Skip
              </Button>
              <Button 
                onClick={handleQuizSubmit}
                disabled={!quizAnswer.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Answer
              </Button>
            </>
          ) : (
            <Button onClick={onClose} className="w-full">
              {type === "break" ? "Got it, taking a break" : "Got it, thanks!"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
