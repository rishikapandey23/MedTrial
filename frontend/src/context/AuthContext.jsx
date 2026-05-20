import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const [token, setToken] = useState(localStorage.getItem('token'));
 const [loading, setLoading] = useState(true);

 // Retrieve current user profile if token is present
 useEffect(() => {
 const bootstrapAuth = async () => {
  if (token) {
  try {
   const response = await api.get('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
   });
   setUser(response.data);
  } catch (error) {
   console.error("Auth validation failed, logging out.", error);
   logout();
  }
  }
  setLoading(false);
 };
 bootstrapAuth();
 }, [token]);

 const login = async (email, password) => {
 const params = new URLSearchParams();
 params.append('username', email);
 params.append('password', password);

 const response = await api.post('/api/auth/login', params, {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
 });

 const { access_token, user: userData } = response.data;
 localStorage.setItem('token', access_token);
 setToken(access_token);
 setUser(userData);
 return userData;
 };

 const register = async (name, email, password, role) => {
 const response = await api.post('/api/auth/register', {
  name,
  email,
  password,
  role: role || "Lead Investigator"
 });
 return response.data;
 };

 const logout = () => {
 localStorage.removeItem('token');
 setToken(null);
 setUser(null);
 };

 return (
 <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
  {children}
 </AuthContext.Provider>
 );
};
