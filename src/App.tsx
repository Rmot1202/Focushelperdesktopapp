import { useState } from "react";
import { Login } from "./components/Login";
import { Sidebar } from "./components/Sidebar";
import { OnboardingChat, SessionData } from "./components/OnboardingChat";
import { SessionSetup } from "./components/SessionSetup";
import { ActiveSession, SessionStats } from "./components/ActiveSession";
import { SlidesGenerator } from "./components/SlidesGenerator";
import { Analytics } from "./components/Analytics";
import { Toaster } from "./components/ui/sonner";

type Screen = "home" | "sessions" | "slides" | "analytics" | "settings";
type Flow = "chat" | "setup" | "active" | "complete";

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [flowState, setFlowState] = useState<Flow>("chat");
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  const handleLogin = (email: string) => {
    setCurrentUser(email);
    // In a real app, load user-specific data from database here
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen("home");
    setFlowState("chat");
    setSessionData(null);
  };

  const handleChatComplete = (data: SessionData) => {
    setSessionData(data);
    setFlowState("setup");
  };

  const handleSetupBack = () => {
    setFlowState("chat");
  };

  const handleSessionStart = (data: SessionData) => {
    setSessionData(data);
    setFlowState("active");
  };

  const handleSessionEnd = (stats: SessionStats) => {
    // In a real app, save session stats here
    console.log("Session ended with stats:", stats);
    setFlowState("complete");
    setCurrentScreen("analytics");
  };

  const handleResumeSession = () => {
    // Resume same session with same data
    setFlowState("chat");
    setSessionData(null);
    setCurrentScreen("home");
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
    if (screen === "home") {
      setFlowState("chat");
      setSessionData(null);
    }
  };

  const renderContent = () => {
    if (currentScreen === "slides") {
      return <SlidesGenerator />;
    }
    
    if (currentScreen === "analytics") {
      return <Analytics />;
    }

    if (currentScreen === "settings") {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl text-white mb-2">Settings</h2>
            <p className="text-zinc-400">Settings panel coming soon...</p>
          </div>
        </div>
      );
    }

    // Home/Sessions flow
    if (flowState === "chat") {
      return <OnboardingChat onComplete={handleChatComplete} />;
    }

    if (flowState === "setup" && sessionData) {
      return (
        <SessionSetup
          initialData={sessionData}
          onStart={handleSessionStart}
          onBack={handleSetupBack}
        />
      );
    }

    if (flowState === "active" && sessionData) {
      return <ActiveSession sessionData={sessionData} onEnd={handleSessionEnd} onResumeSession={handleResumeSession} />;
    }

    return <OnboardingChat onComplete={handleChatComplete} />;
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#1f3740]">
      <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} />
      {renderContent()}
      <Toaster />
    </div>
  );
}