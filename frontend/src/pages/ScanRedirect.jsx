// src/pages/ScanRedirect.jsx
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ScanRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setTableNumber } = useCart();

  useEffect(() => {
    const table = params.get('table');
    if (table) {
      setTableNumber(table);
    }
    // Always navigate to /home
    navigate('/home');
  }, [params, setTableNumber, navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h3>🔄 Redirecting to your table...</h3>
      <p>Table is being assigned. Please wait.</p>
    </div>
  );
}

export default ScanRedirect;
