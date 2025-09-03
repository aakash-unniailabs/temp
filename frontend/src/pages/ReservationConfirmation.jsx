// src/pages/ReservationConfirmation.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import reservationImage from '../assets/reservation.png';
import './ReservationConfirmation.css';

function ReservationConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get reservation data from navigation state (all dynamic now)
  const reservationData = location.state?.reservationData;

  // Fallback data for testing (remove this once working)
  const finalReservationData = reservationData || {
    id: 'R123',
    date: '2025-01-25',
    time: '19:30',
    table_number: 5,
    table_label: 'Table 5'
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleViewReservation = () => {
    navigate('/reservation-details', {
      state: { reservationData: finalReservationData },
      replace: true
    });
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  return (
    <div className="reservation-confirmation-page">
      {/* Header */}
      <div className="confirmation-header">
        <button className="back-btn" onClick={handleBackToHome}>
          ←
        </button>
      </div>

      {/* Confirmation Illustration */}
      <div className="confirmation-illustration">
        <img
          src={reservationImage}
          alt="Reservation Confirmed"
          className="reservation-image"
        />
      </div>

      {/* Success Message */}
      <div className="success-section">
        <h1 className="success-title">Your reservation is confirmed!</h1>
        <p className="success-message">
          We've reserved your table for {formatDate(finalReservationData.date)} at {formatTime(finalReservationData.time)}
        </p>
      </div>

      {/* Quick Details */}
      <div className="quick-details">
        <div className="detail-item">
          <span className="detail-icon">📅</span>
          <span className="detail-text">{formatDate(finalReservationData.date)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">⏰</span>
          <span className="detail-text">{formatTime(finalReservationData.time)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">🪑</span>
          <span className="detail-text">{finalReservationData.table_label || `Table ${finalReservationData.table_number}`}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="view-reservation-btn" onClick={handleViewReservation}>
          View Reservation
        </button>
        <button className="back-home-btn" onClick={handleBackToHome}>
          Back to Home
        </button>
      </div>

      {/* Additional Info */}
      <div className="additional-info">
        <p className="info-text">
          Please arrive 10 minutes before your reservation time. 
          You can view your booking details anytime.
        </p>
      </div>
    </div>
  );
}

export default ReservationConfirmation;
