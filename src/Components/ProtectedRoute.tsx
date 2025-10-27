import React from 'react'
import { useAuth } from '../Context/authContext'
import { Navigate } from 'react-router-dom';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const { user, loading } = useAuth();

   if (loading) {
      return null
   }

   if (!user) {
      return <Navigate to="/login" replace />;
   }

   return <>{children}</>;
};


export default ProtectedRoute