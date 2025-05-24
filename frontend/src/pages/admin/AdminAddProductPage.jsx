import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ProductForm from '../../components/admin/ProductForm';
import { createProduct } from '../../services/productService';

const AdminAddProductPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null); // To display errors from the server

  const handleAddProduct = async (formData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      await createProduct(formData);
      // Using navigate with state for success message (alternative: context, toast library)
      navigate('/admin/products', { state: { successMessage: 'Product added successfully!' } });
    } catch (error) {
      console.error('Failed to add product:', error);
      setServerError(error.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false); // Keep form enabled to allow retry
    } 
    // setIsLoading(false) is not called here if navigation happens, as component unmounts
  };

  return (
    <div className="p-6 bg-gray-800 shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-400">Add New Product</h2>
        <Link 
          to="/admin/products" 
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          &larr; Back to Product List
        </Link>
      </div>
      <ProductForm 
        onSubmit={handleAddProduct} 
        isEditing={false} 
        isLoading={isLoading}
        serverError={serverError} // Pass server error to the form
      />
    </div>
  );
};

export default AdminAddProductPage;
