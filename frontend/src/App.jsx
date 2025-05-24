import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DashboardPage from './pages/DashboardPage'; // User dashboard
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import NotFoundPage from './pages/NotFoundPage';
import NotAuthorizedPage from './pages/NotAuthorizedPage'; // Import NotAuthorizedPage
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute'; // Import AdminRoute
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminAddProductPage from './pages/admin/AdminAddProductPage';
import AdminEditProductPage from './pages/admin/AdminEditProductPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage'; // Import AdminOrderDetailPage
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';

function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const { cart, itemCount } = useCart();
  const isAdmin = user?.roles?.includes('admin'); // Check if user is admin

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4 sticky top-0 z-50">
        <ul className="container mx-auto flex items-center space-x-4">
          <li>
            <Link to="/" className="hover:text-indigo-400">Home</Link>
          </li>
          <li>
            <Link to="/products" className="hover:text-indigo-400">Products</Link>
          </li>
          
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/dashboard" className="hover:text-indigo-400">My Orders</Link> {/* Renamed for clarity */}
              </li>
              {isAdmin && ( // Show Admin link only if user is admin
                <li>
                  <Link to="/admin/dashboard" className="hover:text-teal-400">Admin Panel</Link>
                </li>
              )}
              <li className="ml-auto flex items-center space-x-4">
                <Link to="/cart" className="flex items-center hover:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {/* Display item count if cart is loaded and has items */}
                  {cart && itemCount > 0 && (
                    <span className="ml-1 bg-indigo-600 text-xs text-white font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <span className="text-gray-300">Welcome, {user?.name || 'User'}!</span>
                <button 
                  onClick={logout} 
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md shadow-md transition duration-150 ease-in-out text-sm"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="ml-auto"> {/* Push to the right */}
                <Link to="/login" className="hover:text-indigo-400">Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-indigo-400">Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/not-authorized" element={<NotAuthorizedPage />} /> {/* Route for NotAuthorizedPage */}
          
          {/* User Protected Routes */}
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} /> {/* User order history/dashboard */}

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminRoute />}> {/* Parent route for admin, protected by AdminRoute */}
            <Route element={<AdminLayout />}> {/* Layout for all admin/* routes */}
              <Route index element={<AdminDashboardPage />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminAddProductPage />} />
              <Route path="products/edit/:productId" element={<AdminEditProductPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:orderId" element={<AdminOrderDetailPage />} /> {/* Add route for order details */}
            </Route>
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="bg-gray-800 p-4 text-center text-sm text-gray-500 mt-auto">
        © {new Date().getFullYear()} E-commerce Platform. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
