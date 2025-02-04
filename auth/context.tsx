import React, { createContext, useContext, useEffect, useState } from "react";
import Router from "next/router";
import axiosinstance from "@/service";
const AuthContext = createContext({});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserFromCookies() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          let userId = localStorage.getItem("user.id");
          const data = await axiosinstance.get(`/api/user/${userId}`);
          if (data?.data) setUser(data.data);
        } catch (e: any) {
          if (401 === e.response.status) {
            localStorage.removeItem("token");
            setUser(null);
          }
        }
      }
      setLoading(false);
    }
    loadUserFromCookies();
  }, []);

  const login = async (email: string, password: string) => {
    let response: any = await axiosinstance.post("/login", {
      email,
      password,
    });
    response = response?.data;
    const token = response.token;
    if (token) {
      localStorage.setItem("token", token);
      const data = await axiosinstance.get(`/api/user/${response.user.id}`);
      setUser(data.data);
      await Router.push("/");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    Router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  return useContext(AuthContext);
}
