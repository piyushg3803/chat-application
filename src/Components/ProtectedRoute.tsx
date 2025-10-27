import React from 'react'
import { useAuth } from '../Context/authContext'
import { Navigate } from 'react-router-dom';

interface ProtecteChildren {
   children: React.ReactNode
}

function ProtectedRoute({ children }: ProtecteChildren) {

   const { user } = useAuth();
   if (!user) {
      alert("Please Login to Access This Page")
      return < Navigate to={'/login'} replace />;
   }

   return (
      <>{children}</>
   )
}

export default ProtectedRoute