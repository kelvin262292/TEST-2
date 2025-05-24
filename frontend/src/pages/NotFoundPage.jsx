import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="p-4 text-center">
      <h1 className="text-4xl font-bold text-red-500 mb-4">404 - Page Not Found</h1>
      <p className="mb-4">Oops! The page you are looking for does not exist.</p>
      <Link to="/" className="text-indigo-400 hover:text-indigo-600 underline">
        Go back to Home Page
      </Link>
    </div>
  );
};

export default NotFoundPage;
