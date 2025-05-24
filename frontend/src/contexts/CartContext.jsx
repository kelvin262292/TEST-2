import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as cartService from '../services/cartService'; // Import all functions from cartService
import { useAuth } from './AuthContext'; // To check if user is authenticated

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null); // Will hold { items: [], totalPrice: 0, totalItems: 0, ... }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth(); // Get authentication status and user

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCart(null); // Clear cart if not authenticated
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message || 'Failed to fetch cart.');
      // setCart(null); // Optionally clear cart on error or keep stale data
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]); // Dependencies for useCallback

  // Effect to load cart on initial mount or when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null); // Clear cart if user logs out
    }
  }, [isAuthenticated, fetchCart]); // fetchCart is memoized with useCallback

  const addToCart = async (productId, quantity) => {
    if (!isAuthenticated) {
      setError('User must be logged in to add items to cart.');
      // Consider redirecting to login or showing a modal
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await cartService.addItemToCart(productId, quantity);
      await fetchCart(); // Refresh cart after adding
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message || 'Failed to add item to cart.');
      // Potentially re-fetch cart even on error to ensure UI consistency
      // await fetchCart(); 
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      await cartService.updateCartItem(itemId, quantity);
      await fetchCart(); // Refresh cart
    } catch (err) {
      console.error('Error updating item quantity:', err);
      setError(err.message || 'Failed to update item quantity.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeItemFromCart = async (itemId) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      await cartService.removeCartItem(itemId);
      await fetchCart(); // Refresh cart
    } catch (err) {
      console.error('Error removing item from cart:', err);
      setError(err.message || 'Failed to remove item from cart.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearUserCart = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      await cartService.clearCart();
      await fetchCart(); // Refresh cart (should be empty)
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message || 'Failed to clear cart.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    cart,
    isLoading,
    error,
    fetchCart, // Expose if manual refresh is needed
    addToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearUserCart,
    // Convenience property for quick check, derived from cart state
    itemCount: cart?.totalItems || 0 
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
