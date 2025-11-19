import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { BookOpen, Upload, FileText, CheckCircle2, XCircle, RefreshCw, BookMarked } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: "A" | "B" | "C" | "D";
  topic: string;
  review_hint: string;
}

interface WrongAnswer {
  topic: string;
  review_hint: string;
}

interface PostSessionQuizProps {
  open: boolean;
  onClose: () => void;
  onResumeSession: () => void;
  sessionData: {
    duration: number;
    avgFocus: number;
    energyDrinks: number;
    snacks: number;
  };
}

export function PostSessionQuiz({ open, onClose, onResumeSession, sessionData }: PostSessionQuizProps) {
  const [step, setStep] = useState<"input" | "quiz" | "results">("input");
  const [inputMethod, setInputMethod] = useState<"summary" | "file" | null>(null);
  const [studyMaterial, setStudyMaterial] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [userAnswers, setUserAnswers] = useState<("A" | "B" | "C" | "D")[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const resetQuiz = () => {
    setStep("input");
    setInputMethod(null);
    setStudyMaterial("");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setWrongAnswers([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setStudyMaterial(text);
      toast.success("File uploaded successfully");
    };

    if (file.type === "text/plain") {
      reader.readAsText(file);
    } else {
      toast.error("Please upload a .txt file");
    }
  };

  const generateQuiz = async () => {
    if (!studyMaterial.trim()) {
      toast.error("Please provide study material first");
      return;
    }

    setIsGenerating(true);

    // Simulate OpenAI API call - In production, call your backend
    // that interfaces with OpenAI using the material
    setTimeout(() => {
      // Mock quiz questions based on generic study material
      const mockQuestions: QuizQuestion[] = [
        {
          question: "What is the primary purpose of using logistic regression in machine learning?",
          options: {
            A: "To predict continuous numerical values",
            B: "To classify data into discrete categories",
            C: "To cluster similar data points",
            D: "To reduce data dimensionality"
          },
          answer: "B",
          topic: "Logistic Regression Basics",
          review_hint: "Review the fundamental differences between regression and classification algorithms. Focus on binary and multi-class classification use cases."
        },
        {
          question: "Which evaluation metric is most appropriate for imbalanced classification datasets?",
          options: {
            A: "Accuracy",
            B: "Mean Squared Error",
            C: "F1 Score",
            D: "R-squared"
          },
          answer: "C",
          topic: "Model Evaluation Metrics",
          review_hint: "Study how precision and recall combine to form F1 score, and why accuracy can be misleading with imbalanced data."
        },
        {
          question: "What does overfitting indicate in a machine learning model?",
          options: {
            A: "The model performs poorly on both training and test data",
            B: "The model performs well on training data but poorly on test data",
            C: "The model performs poorly on training data but well on test data",
            D: "The model performs equally well on all datasets"
          },
          answer: "B",
          topic: "Overfitting and Generalization",
          review_hint: "Review the concepts of bias-variance tradeoff and techniques to prevent overfitting like regularization and cross-validation."
        },
        {
          question: "In the context of neural networks, what is the purpose of an activation function?",
          options: {
            A: "To initialize weights randomly",
            B: "To introduce non-linearity into the model",
            C: "To calculate the loss function",
            D: "To normalize input data"
          },
          answer: "B",
          topic: "Neural Network Fundamentals",
          review_hint: "Study common activation functions (ReLU, sigmoid, tanh) and understand why linear models can't solve complex problems."
        },
        {
          question: "What is the main advantage of using cross-validation over a single train-test split?",
          options: {
            A: "It trains the model faster",
            B: "It requires less data",
            C: "It provides a more robust estimate of model performance",
            D: "It eliminates the need for a test set"
          },
          answer: "C",
          topic: "Cross-Validation Techniques",
          review_hint: "Review k-fold cross-validation and how it helps reduce variance in performance estimates by using multiple train-test splits."
        }
      ];

      setQuestions(mockQuestions);
      setStep("quiz");
      setIsGenerating(false);
      toast.success("Quiz generated! Good luck!");
    }, 2000);
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) {
      toast.error("Please select an answer");
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;

    setUserAnswers([...userAnswers, selectedAnswer]);

    if (!isCorrect) {
      setWrongAnswers([
        ...wrongAnswers,
        {
          topic: currentQuestion.topic,
          review_hint: currentQuestion.review_hint
        }
      ]);
      toast.error(`Incorrect. The correct answer is ${currentQuestion.answer}`);
    } else {
      toast.success("Correct!");
    }

    // Move to next question or results
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setStep("results");
    }
  };

  const calculateScore = () => {
    const correctCount = questions.length - wrongAnswers.length;
    return {
      correct: correctCount,
      total: questions.length,
      percentage: (correctCount / questions.length) * 100
    };
  };

  const handleResumeSession = () => {
    onClose();
    resetQuiz();
    onResumeSession();
  };

  const handleFinish = () => {
    onClose();
    resetQuiz();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1f3740] border-[#7EC4B6]/20">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#7EC4B6]" />
            Post-Session Review Quiz
          </DialogTitle>
          <DialogDescription className="text-[#A8DCD1]/80 text-sm">
            Test your knowledge and reinforce your learning from the session.
          </DialogDescription>
        </DialogHeader>

        {/* Session Summary */}
        <Card className="p-4 bg-[#2C4A52] border-[#7EC4B6]/20 mb-4">
          <h3 className="text-white mb-3">Session Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#A8DCD1]/60">Duration</p>
              <p className="text-white">{sessionData.duration.toFixed(1)} minutes</p>
            </div>
            <div>
              <p className="text-[#A8DCD1]/60">Average Focus</p>
              <p className="text-white">{sessionData.avgFocus.toFixed(1)}/100</p>
            </div>
            <div>
              <p className="text-[#A8DCD1]/60">Energy Drinks</p>
              <p className="text-white">{sessionData.energyDrinks}</p>
            </div>
            <div>
              <p className="text-[#A8DCD1]/60">Snacks</p>
              <p className="text-white">{sessionData.snacks}</p>
            </div>
          </div>
        </Card>

        {/* Step 1: Input Method Selection */}
        {step === "input" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white mb-2">How would you like to provide study material?</h3>
              <p className="text-[#A8DCD1]/80 text-sm mb-4">
                We'll generate quiz questions based on what you studied to help reinforce your learning.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card
                className={`p-6 cursor-pointer transition-all ${
                  inputMethod === "summary"
                    ? "bg-[#7EC4B6]/20 border-[#7EC4B6]"
                    : "bg-[#2C4A52] border-[#7EC4B6]/20 hover:border-[#7EC4B6]/50"
                }`}
                onClick={() => setInputMethod("summary")}
              >
                <FileText className="w-8 h-8 text-[#7EC4B6] mb-3" />
                <h4 className="text-white mb-2">Type Summary</h4>
                <p className="text-[#A8DCD1]/60 text-sm">
                  Enter a brief summary of what you studied
                </p>
              </Card>

              <Card
                className={`p-6 cursor-pointer transition-all ${
                  inputMethod === "file"
                    ? "bg-[#7EC4B6]/20 border-[#7EC4B6]"
                    : "bg-[#2C4A52] border-[#7EC4B6]/20 hover:border-[#7EC4B6]/50"
                }`}
                onClick={() => setInputMethod("file")}
              >
                <Upload className="w-8 h-8 text-[#7EC4B6] mb-3" />
                <h4 className="text-white mb-2">Upload File</h4>
                <p className="text-[#A8DCD1]/60 text-sm">
                  Upload your notes or study materials (.txt)
                </p>
              </Card>
            </div>

            {inputMethod === "summary" && (
              <div className="space-y-3">
                <label className="text-[#A8DCD1]">Study Summary</label>
                <Textarea
                  placeholder="Example: Studied logistic regression for binary classification, learned about sigmoid function, gradient descent optimization, and model evaluation metrics like precision and recall..."
                  value={studyMaterial}
                  onChange={(e) => setStudyMaterial(e.target.value)}
                  className="min-h-40 bg-[#2C4A52] border-[#7EC4B6]/30 text-white placeholder:text-zinc-500"
                />
              </div>
            )}

            {inputMethod === "file" && (
              <div className="space-y-3">
                <label className="text-[#A8DCD1]">Upload Study Notes</label>
                <div className="border-2 border-dashed border-[#7EC4B6]/30 rounded-lg p-8 text-center bg-[#2C4A52]/50">
                  <Upload className="w-12 h-12 text-[#7EC4B6] mx-auto mb-3" />
                  <p className="text-[#A8DCD1]/80 mb-3">
                    {studyMaterial ? "File uploaded successfully" : "Drag and drop a file or click to browse"}
                  </p>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="border-[#7EC4B6]/30 text-[#7EC4B6]" asChild>
                      <span>Choose File (.txt)</span>
                    </Button>
                  </label>
                  {studyMaterial && (
                    <p className="text-[#7EC4B6] text-sm mt-3">✓ Content loaded ({studyMaterial.length} characters)</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleFinish}
                variant="outline"
                className="flex-1 border-[#7EC4B6]/30 text-[#A8DCD1] hover:bg-[#2C4A52]"
              >
                Skip Quiz
              </Button>
              <Button
                onClick={generateQuiz}
                disabled={!studyMaterial.trim() || isGenerating}
                className="flex-1 bg-[#7EC4B6] hover:bg-[#6BB3A5] text-[#1f3740]"
              >
                {isGenerating ? "Generating Quiz..." : "Generate Quiz"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Quiz Questions */}
        {step === "quiz" && questions.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-white">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h3>
              <span className="text-[#7EC4B6] text-sm">
                {userAnswers.length} answered
              </span>
            </div>

            <Progress
              value={((currentQuestionIndex + 1) / questions.length) * 100}
              className="h-2 bg-[#2C4A52]"
            />

            <Card className="p-6 bg-[#2C4A52] border-[#7EC4B6]/20">
              <div className="mb-4">
                <span className="text-[#7EC4B6] text-sm">{questions[currentQuestionIndex].topic}</span>
              </div>
              <p className="text-white text-lg mb-6">{questions[currentQuestionIndex].question}</p>

              <div className="space-y-3">
                {(["A", "B", "C", "D"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedAnswer(option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAnswer === option
                        ? "bg-[#7EC4B6]/20 border-[#7EC4B6]"
                        : "bg-[#1f3740] border-[#7EC4B6]/20 hover:border-[#7EC4B6]/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-[#7EC4B6] font-bold">{option}.</span>
                      <span className="text-white flex-1">
                        {questions[currentQuestionIndex].options[option]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Button
              onClick={handleAnswerSubmit}
              disabled={!selectedAnswer}
              className="w-full bg-[#7EC4B6] hover:bg-[#6BB3A5] text-[#1f3740]"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results"}
            </Button>
          </div>
        )}

        {/* Step 3: Results */}
        {step === "results" && (
          <div className="space-y-6">
            {(() => {
              const score = calculateScore();
              const passed = score.percentage >= 70;

              return (
                <>
                  <Card className={`p-6 text-center ${
                    passed
                      ? "bg-[#7EC4B6]/10 border-[#7EC4B6]"
                      : "bg-amber-500/10 border-amber-500/50"
                  }`}>
                    {passed ? (
                      <CheckCircle2 className="w-16 h-16 text-[#7EC4B6] mx-auto mb-4" />
                    ) : (
                      <BookMarked className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    )}
                    <h3 className="text-white text-2xl mb-2">
                      {passed ? "Great Job! 🎉" : "Room for Improvement"}
                    </h3>
                    <p className="text-[#A8DCD1] mb-4">
                      You scored {score.correct} out of {score.total} ({score.percentage.toFixed(0)}%)
                    </p>
                    {passed ? (
                      <p className="text-[#A8DCD1]/80 text-sm">
                        Excellent work! Do a quick skim of your notes to keep everything fresh.
                      </p>
                    ) : (
                      <p className="text-[#A8DCD1]/80 text-sm">
                        Don't worry! Review the topics below and consider another focused study session.
                      </p>
                    )}
                  </Card>

                  {wrongAnswers.length > 0 && (
                    <Card className="p-6 bg-[#2C4A52] border-[#7EC4B6]/20">
                      <h3 className="text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#7EC4B6]" />
                        Review Suggestions
                      </h3>
                      <div className="space-y-4">
                        {wrongAnswers.map((item, idx) => (
                          <div key={idx} className="border-l-2 border-[#7EC4B6] pl-4">
                            <h4 className="text-[#7EC4B6] mb-1">{item.topic}</h4>
                            <p className="text-[#A8DCD1]/80 text-sm">{item.review_hint}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  <div className="flex gap-3">
                    {!passed && (
                      <Button
                        onClick={handleResumeSession}
                        className="flex-1 bg-[#7EC4B6] hover:bg-[#6BB3A5] text-[#1f3740] flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Start Another Study Session
                      </Button>
                    )}
                    <Button
                      onClick={handleFinish}
                      variant="outline"
                      className={`${
                        passed ? "flex-1" : "flex-1"
                      } border-[#7EC4B6]/30 text-[#A8DCD1] hover:bg-[#2C4A52]`}
                    >
                      {passed ? "Finish" : "Review Later"}
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}