// src/pages/ReservationDetails.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReservation } from '../context/ReservationContext';
import axios from 'axios';
import './ReservationDetails.css';

function ReservationDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentReservation, clearReservation } = useReservation();

  // Get reservation data from navigation state OR context
  const reservationData = location.state?.reservationData || currentReservation;

  // If no reservation data, redirect to reservation page
  if (!reservationData) {
    navigate('/reservation');
    return null;
  }

  // Calculate countdown timer to reservation date/time
  const calculateTimeLeft = () => {
    const reservationDateTime = new Date(`${reservationData.date}T${reservationData.time}`);
    const now = new Date();
    const difference = reservationDateTime - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    } else {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  };

  // Countdown timer state (dynamic calculation)
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [cancelling, setCancelling] = useState(false);

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [reservationData.date, reservationData.time]);

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  // Restaurant contact info from environment variables
  const restaurantPhone = process.env.REACT_APP_RESTAURANT_PHONE || '(555) 123-4567';
  const restaurantName = process.env.REACT_APP_RESTAURANT_NAME || 'Your Restaurant Name';

  const handleContactRestaurant = () => {
    const phoneNumber = restaurantPhone.replace(/[^\d]/g, ''); // Remove formatting
    window.open(`tel:+1${phoneNumber}`);
  };

  const handleCancelReservation = async () => {
    if (!window.confirm('Are you sure you want to cancel your reservation?')) {
      return;
    }

    setCancelling(true);

    try {
      console.log('🗑️ Cancelling reservation:', reservationData.id);

      // Step 1: Delete reservation from customer backend
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/reservation/${reservationData.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ Reservation deleted from customer backend');
        } catch (error) {
          console.log('⚠️ Could not delete from customer backend:', error.message);
        }
      }

      // Step 2: Update table status to "Available" in admin backend
      try {
        const adminBackendUrl = process.env.REACT_APP_ADMIN_BACKEND_URL || 'http://localhost:4000';
        await axios.patch(`${adminBackendUrl}/api/table/${reservationData.table_id}/customer-status`, {
          status: 'Available'
        });
        console.log('✅ Table status updated to Available in admin backend');
      } catch (error) {
        console.error('❌ Failed to update table status in admin backend:', error);
      }

      // Step 3: Clear reservation from local state
      clearReservation();

      // Step 4: Navigate back to reservation booking page
      navigate('/reservation');

      console.log('✅ Reservation cancelled successfully');

    } catch (error) {
      console.error('❌ Error cancelling reservation:', error);
      alert('Failed to cancel reservation. Please try again or contact the restaurant.');
    } finally {
      setCancelling(false);
    }
  };

  const generateQRCode = () => {
    const qrData = JSON.stringify({
      reservationId: reservationData.id,
      tableNumber: reservationData.table_number,
      date: reservationData.date,
      time: reservationData.time,
      restaurant: restaurantName
    });
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}`;
  };

  return (
    <div className="reservation-details-page">
      {/* ❌ Removed extra exit/back button */}
      <h1 className="page-title">Your Table is Booked!</h1>

      {/* Booking Status */}
      <div className="booking-status">
        <div className="status-icon">✅</div>
        <h2 className="status-title">Your table is booked!</h2>
      </div>

      {/* Date & Time Section */}
      <div className="datetime-section">
        <h3 className="section-title">Date & Time</h3>
        <div className="datetime-display">
          <span className="date-text">{formatDate(reservationData.date)}</span>
          <span className="time-text">{formatTime(reservationData.time)}</span>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="countdown-section">
        <div className="countdown-grid">
          <div className="countdown-item">
            <div className="countdown-number">{timeLeft.days}</div>
            <div className="countdown-label">Days</div>
          </div>
          <div className="countdown-item">
            <div className="countdown-number">{timeLeft.hours}</div>
            <div className="countdown-label">Hours</div>
          </div>
          <div className="countdown-item">
            <div className="countdown-number">{timeLeft.minutes}</div>
            <div className="countdown-label">Minutes</div>
          </div>
          <div className="countdown-item">
            <div className="countdown-number">{timeLeft.seconds}</div>
            <div className="countdown-label">Seconds</div>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="booking-details-section">
        <h3 className="section-title">Booking Details</h3>
        <div className="details-list">
          <div className="detail-row">
            <span className="detail-icon">🎫</span>
            <span className="detail-label">Booking ID</span>
            <span className="detail-value">{reservationData.id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-icon">🪑</span>
            <span className="detail-label">Table No.</span>
            <span className="detail-value">{reservationData.table_number}</span>
          </div>
        </div>
      </div>
{/* QR Code Section replaced with Home Navigation Button */}
<div className="qr-section">
  <h3 className="section-title">Scan QR Code</h3>
  <div className="qr-container">
    <button 
      className="scan-btn"
      onClick={() => navigate('/')} // Navigate to home page
    >
      <span className="scan-icon">📱</span>
      <span className="scan-text">Scan a QR code on the table</span>
    </button>
  </div>
</div>


      {/* Contact Section */}
      <div className="contact-section">
        <h3 className="section-title">Contact</h3>
        <button className="contact-btn" onClick={handleContactRestaurant}>
          <span className="contact-icon">📞</span>
          <span className="contact-text">{restaurantPhone}</span>
        </button>
      </div>

      {/* Table Number Display */}
      <div className="table-display">
        <div className="table-number-circle">
          <span className="table-number">{reservationData.table_number}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="modify-btn">
          Modify Reservation
        </button>
        <button
          className="cancel-btn"
          onClick={handleCancelReservation}
          disabled={cancelling}
        >
          {cancelling ? 'Cancelling...' : 'Cancel Reservation'}
        </button>
      </div>
    </div>
  );
}

export default ReservationDetails;
