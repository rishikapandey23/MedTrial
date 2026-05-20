import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
 const { token, loading } = useContext(AuthContext);

 if (loading) {
 return (
  <div className="flex h-screen w-screen items-center justify-center bg-[#0b0f19]">
  <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
  </div>
 );
 }

 if (!token) {
 return <Navigate to="/login" replace />;
 }

 return children;
};

export default ProtectedRoute;
