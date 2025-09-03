// src/context/ReservationContext.jsx
import React, { createContext, useContext, useState } from 'react';

const ReservationContext = createContext();

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};

export const ReservationProvider = ({ children }) => {
  const [currentReservation, setCurrentReservation] = useState(null);
  const [reservationHistory, setReservationHistory] = useState([]);

  // Load reservation from localStorage on component mount
  React.useEffect(() => {
    loadReservationFromStorage();
  }, []);

  // Save current reservation
  const saveReservation = (reservationData) => {
    setCurrentReservation(reservationData);

    // Add to history if not already there
    const existingIndex = reservationHistory.findIndex(r => r.id === reservationData.id);
    if (existingIndex === -1) {
      setReservationHistory(prev => [reservationData, ...prev]);
    }

    // Save to localStorage for persistence
    localStorage.setItem('currentReservation', JSON.stringify(reservationData));
    localStorage.setItem('reservationHistory', JSON.stringify([reservationData, ...reservationHistory]));
  };

  // Clear current reservation
  const clearReservation = () => {
    setCurrentReservation(null);
    localStorage.removeItem('currentReservation');
  };

  // Load reservation from localStorage on app start
  const loadReservationFromStorage = () => {
    try {
      const saved = localStorage.getItem('currentReservation');
      const history = localStorage.getItem('reservationHistory');

      if (saved) {
        const parsedReservation = JSON.parse(saved);
        setCurrentReservation(parsedReservation);
      }

      if (history) {
        setReservationHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading reservation from storage:', error);
    }
  };

  // Calculate time until reservation
  const getTimeUntilReservation = (reservationData) => {
    if (!reservationData) return null;
    
    const reservationDateTime = new Date(`${reservationData.date}T${reservationData.time}`);
    const now = new Date();
    const difference = reservationDateTime - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  };

  // Format reservation date
  const formatReservationDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format reservation time
  const formatReservationTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Check if reservation is active (show details for any reservation that exists)
  const isUpcomingReservation = (reservationData) => {
    if (!reservationData) return false;

    // For now, show details for any reservation that exists
    // You can add more sophisticated logic later (e.g., only show for today's reservations)
    return true;

    // Alternative: Only show if reservation is today or in the future
    // const reservationDate = new Date(reservationData.date);
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // return reservationDate >= today;
  };

  const value = {
    currentReservation,
    reservationHistory,
    saveReservation,
    clearReservation,
    loadReservationFromStorage,
    getTimeUntilReservation,
    formatReservationDate,
    formatReservationTime,
    isUpcomingReservation
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};

export default ReservationContext;