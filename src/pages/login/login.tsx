import React, { useState } from "react";
import { baseURL } from "@/components/api/base";
import { Eye, EyeOff } from "lucide-react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseURL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Invalid credentials");
        return;
      }

      const data = await response.json();
      const token = data.access_token;
      localStorage.setItem("access_token", data.access_token);

      // Fetch current user
      const userRes = await fetch(`${baseURL}/api/v1/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const user = await userRes.json();
      localStorage.setItem("current_user", JSON.stringify(user));

      window.location.href = "/";
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 overflow-hidden">
      {/* Animated Floating Blobs */}
      <div
        className="absolute -top-20 -left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
        style={{ animation: 'blob 7s infinite', animationDelay: '0s' }}
      ></div>
      <div
        className="absolute top-20 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
        style={{ animation: 'blob 7s infinite', animationDelay: '2s' }}
      ></div>
      <div
        className="absolute -bottom-16 right-0 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
        style={{ animation: 'blob 7s infinite', animationDelay: '4s' }}
      ></div>

      {/* Login Card with Glassmorphism */}
      <div className="relative z-10 p-8 rounded-xl shadow-lg bg-white/30 backdrop-blur-lg max-w-md w-full transform transition duration-500 hover:scale-105">
        <h1 className="text-4xl font-extrabold text-center text-white mb-6 drop-shadow-lg">
          VisionNest
        </h1>
        <p className="text-center text-white mb-8 tracking-wide">
          Sign in to your account
        </p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="mt-2 w-full px-4 py-3 bg-white/20 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder-white text-white"
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="mt-2 w-full pr-12 px-4 py-3 bg-white/20 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder-white text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-black"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-300 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold rounded-lg shadow hover:opacity-90 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
