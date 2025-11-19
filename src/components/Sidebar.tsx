import { Home, Activity, Presentation, BarChart3, Settings, LogOut, User } from "lucide-react";
import logo from "figma:asset/1b757825849eec4d5898e43cdcb902dd1ddfc599.png";

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  currentUser: string;
  onLogout: () => void;
}

export function Sidebar({ currentScreen, onNavigate, currentUser, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "sessions", label: "Sessions", icon: Activity },
    { id: "slides", label: "Slides", icon: Presentation },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-60 bg-[#2C4A52] border-r border-[#7EC4B6]/20 flex flex-col h-screen">
      <div className="p-4 border-b border-[#7EC4B6]/20">
        <img src={logo} alt="FocusFrame" className="w-40 mx-auto" />
      </div>
      
      {/* User info */}
      <div className="px-4 py-3 border-b border-[#7EC4B6]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7EC4B6]/20 flex items-center justify-center">
            <User className="w-5 h-5 text-[#7EC4B6]" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm">{currentUser}</p>
            <p className="text-[#A8DCD1]/60 text-xs">Student</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? "bg-[#7EC4B6]/20 text-[#7EC4B6]"
                  : "text-[#A8DCD1] hover:bg-[#1f3740] hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Version info */}
      <div className="px-4 py-3 border-t border-[#7EC4B6]/20">
        <div className="text-center">
          <p className="text-[#A8DCD1]/60 text-xs">FocusFrame v1.0.0</p>
          <p className="text-[#A8DCD1]/40 text-xs mt-1">Beta Release</p>
        </div>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-[#7EC4B6]/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#A8DCD1] hover:bg-[#1f3740] hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}