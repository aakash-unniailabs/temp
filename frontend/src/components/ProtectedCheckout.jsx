// src/components/ProtectedCheckout.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Auth from './Auth';
import './ProtectedCheckout.css';

const ProtectedCheckout = ({ children, onAuthSuccess }) => {
  const { user } = useContext(AuthContext);

  // If user is not logged in, show auth component
  if (!user) {
    return (
      <div className="protected-checkout-container">
        <div className="checkout-header">
          <div className="checkout-icon"></div>
          <h3 className="checkout-title">Complete Your Order</h3>
          <p className="checkout-subtitle">
            Please sign in to place your order and track your delivery
          </p>
        </div>

        <div className="auth-wrapper">
          <Auth onSuccess={onAuthSuccess} />
        </div>
      </div>
    );
  }

  // If user is logged in, show the protected content (checkout)
  return children;
};

export default ProtectedCheckout;
