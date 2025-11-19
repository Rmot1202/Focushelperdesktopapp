import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import logo from "figma:asset/1b757825849eec4d5898e43cdcb902dd1ddfc599.png";

interface LoginProps {
  onLogin: (email: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // In a real app, this would authenticate with backend/Supabase
      onLogin(email.trim());
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#2C4A52] via-[#1f3740] to-[#1a2f38]">
      <Card className="w-full max-w-md mx-4 p-8 bg-[#1f3740]/80 backdrop-blur-xl border-[#7EC4B6]/20 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="FocusFrame" className="w-48 h-auto" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-white mb-2">{isSignup ? "Create Account" : "Welcome Back"}</h2>
          <p className="text-[#A8DCD1]/80">
            {isSignup 
              ? "Start your journey to better focus" 
              : "Sign in to continue your study sessions"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-[#A8DCD1]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 bg-[#2C4A52]/50 border-[#7EC4B6]/30 text-white placeholder:text-zinc-500 focus:border-[#7EC4B6]"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-[#A8DCD1]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 bg-[#2C4A52]/50 border-[#7EC4B6]/30 text-white placeholder:text-zinc-500 focus:border-[#7EC4B6]"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#7EC4B6] hover:bg-[#6BB3A5] text-[#1f3740]"
          >
            {isSignup ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-[#7EC4B6] hover:text-[#A8DCD1] transition-colors"
          >
            {isSignup 
              ? "Already have an account? Sign in" 
              : "Don't have an account? Sign up"}
          </button>
        </div>

        <p className="text-xs text-[#A8DCD1]/60 text-center mt-8">
          FocusFrame uses AI-powered prediction and real-time tracking to boost your study success
        </p>
      </Card>
    </div>
  );
}