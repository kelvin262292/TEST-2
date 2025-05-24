import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a loading spinner or a blank page while auth state is being determined
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl">Loading authentication status...</p>
        {/* Consider adding a spinner component here */}
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect non-authenticated users to the login page, saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.roles?.includes('admin')) {
    // Redirect authenticated users who are not admins to the /not-authorized page
    return <Navigate to="/not-authorized" state={{ from: location }} replace />;
  }

  // If authenticated and an admin, render the children or Outlet for nested routes
  return children ? children : <Outlet />;
};

export default AdminRoute;
