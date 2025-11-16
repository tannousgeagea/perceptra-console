import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Checkbox } from "@/components/ui/ui/checkbox";
import { Label } from "@/components/ui/ui/label";
import { Card } from "@/components/ui/ui/card";
import { Eye, EyeOff, ScanEye, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { OAuthButtons } from '@/components/auth/OAuthButtons';

// Array of welcome messages to rotate through
const welcomeMessages = [
  "Welcome back, let's get to work.",
  "Ready to visualize smarter?",
  "Let's transform some data.",
  "Your insights await you.",
  "Structure your vision. Empower your data."
];

// Array of taglines to rotate through
const taglines = [
  "Structure your vision. Empower your data.",
  "One platform to view it all.",
  "Transform visual data into insights.",
  "Visualize better. Decide smarter."
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [welcomeIndex, setWelcomeIndex] = useState(0);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Rotate welcome message every 5 seconds
  useEffect(() => {
    const welcomeInterval = setInterval(() => {
      setWelcomeIndex(prev => (prev + 1) % welcomeMessages.length);
    }, 7000);
    
    const taglineInterval = setInterval(() => {
      setTaglineIndex(prev => (prev + 1) % taglines.length);
    }, 7000);
    
    return () => {
      clearInterval(welcomeInterval);
      clearInterval(taglineInterval);
    };
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const success = await login(email, password, rememberMe);
      if (success) {
        navigate('/', { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    // Toggle dark mode class on document
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen w-full flex transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Left: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <span className="flex justify-center items-center text-visionNest-purple mx-auto hover:rotate-[5deg] transition-all duration-300">
              <ScanEye className='w-6 h-6 mr-1'/>
              <h2>VisionNest</h2>
            </span>
            <h2 className="mt-6 text-xl font-bold text-visionNest-navy dark:text-white">
              {welcomeMessages[welcomeIndex]}
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 transition-opacity duration-300 animate-fade-in">
              Sign in to continue to VisionNest
            </p>
          </div>
          
          <Card className="p-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/90 backdrop-blur transition-all duration-300 hover:shadow-xl">
            <OAuthButtons className="mb-6" />
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
                <div className="relative group">
                < div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2 border-gray-300 dark:border-gray-700 focus:border-visionNest-purple focus:ring-visionNest-purple dark:bg-gray-800 dark:text-white transition-all duration-200 group-hover:border-visionNest-purple"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-visionNest-purple transition-all duration-300 group-hover:w-full"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-300">Password</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 py-2 pr-10 border-gray-300 dark:border-gray-700 focus:border-visionNest-purple focus:ring-visionNest-purple dark:bg-gray-800 dark:text-white transition-all duration-200 group-hover:border-visionNest-purple"
                  />
                  <button 
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-visionNest-purple transition-all duration-300 group-hover:w-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox 
                    id="remember-me" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="text-visionNest-purple focus:ring-visionNest-purple rounded border-gray-300 dark:border-gray-600"
                  />
                  <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                    Remember me
                  </Label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="text-visionNest-purple hover:text-visionNest-blue dark:text-visionNest-purple/90 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-visionNest-purple hover:bg-visionNest-blue text-white transition-colors relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </span>
                <span className="absolute bottom-0 left-0 h-full w-0 bg-visionNest-blue transition-all duration-300 group-hover:w-full"></span>
              </Button>
              
              {!isSubmitting && (
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Please wait while we verify your credentials
                </p>
              )}
            </form>
          </Card>
          
          <div className="flex justify-between items-center">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <a href="#" className="text-visionNest-purple hover:text-visionNest-blue dark:text-visionNest-purple/90 font-medium transition-colors">
                Create an account
              </a>
            </p>
            
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Right: Gradient Background */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        {/* Decorative eye pattern elements */}
        <div className="absolute top-1/4 left-1/4 w-28 h-28 rounded-full border-4 border-white/20 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-16 h-16 rounded-full border-2 border-white/10"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full border-2 border-white/15"></div>
        
        <div className="h-full w-full bg-vision-gradient animate-gradient-flow bg-[length:400%_400%] flex flex-col items-center justify-center">
          <div className="max-w-lg p-8 text-white text-center z-10">
            <h2 className="text-4xl font-bold mb-4">Visualize Better</h2>
            <p className="text-xl opacity-90 mb-6">
              {taglines[taglineIndex]}
            </p>
            <div className="mt-8 relative">
              <div className="h-12 w-12 rounded-full border-2 border-white/50 mx-auto"></div>
              <div className="h-8 w-8 rounded-full border-2 border-white/80 absolute top-2 left-1/2 transform -translate-x-1/2"></div>
              <div className="h-4 w-4 rounded-full bg-white/90 absolute top-4 left-1/2 transform -translate-x-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;