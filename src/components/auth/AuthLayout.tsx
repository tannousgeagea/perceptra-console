import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/ui/button";
import { Sun, Moon } from "lucide-react";
import { LoginVisual } from "@/components/auth/LoginVisual";

export const AuthLayout = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div
      className={`min-h-screen w-full flex transition-colors duration-300 ${
        isDarkMode ? "dark" : ""
      }`}
    >
      {/* Left Side Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Page Content */}
        <div className="w-full max-w-md px-4 sm:px-6 relative z-10">
          <div className="space-y-8 animate-fade-in-up">
            <Outlet />
          </div>
        </div>
      </div>

    {/* Dark Mode Toggle */}
    <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className="absolute top-4 left-4 rounded-full hover:bg-muted transition-all duration-300"
        aria-label="Toggle dark mode"
    >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>

      {/* Right Panel */}
      <LoginVisual />
    </div>
  );
};
