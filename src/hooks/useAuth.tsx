import axios from "axios";
import { baseURL } from "@/components/api/base";

export const authService = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${baseURL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Invalid credentials");
    }

    const data = await res.json();
    console.log(data)
    return {
      token: data.access_token,
      refreshToken: data.refresh_token,
      expires_at: data.expires_in,
      user: data.user,
    };

    // return res.json(); // { access_token, refresh_token }
  },

  getUser: async (token: string) => {
    const res = await fetch(`${baseURL}/api/v1/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user profile");
    }

    return res.json(); // { id, email, name, ... }
  },

  refreshToken: async (refreshToken: string) => {
    const response = await fetch(`${baseURL}/api/v1/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Invalid credentials");
    }

    const data = await response.json();
    return {
      token: data.access_token,
      refreshToken: data.refresh_token,
      expires_at: data.expires_at,
    }
  },
};
