import React from 'react';
import { useNavigate } from 'react-router-dom';

import qrImage from '../assets/Qr.svg';
import tableIllustration from '../assets/reservation.png';

function Welcome() {
  const navigate = useNavigate();

  const handleScanClick = () => {
    const fakeTableNumber = '5';
    navigate(`/scan?table=${fakeTableNumber}`);
  };

  const handleReservationClick = () => {
    navigate('/reservation');
  };

  const handleStartOrderingClick = () => {
    // Direct navigation to home page for ordering
    navigate('/home');
  };

  return (
    <div style={styles.container}>
      <div style={styles.qrSection}>
        <img src={qrImage} alt="QR Code" style={styles.qrImage} />
        <button onClick={handleScanClick} style={styles.button}>
          Scan QR Code on Table
        </button>
      </div>

      <h3 style={styles.orText}>or</h3>

      <div style={styles.illustrationSection}>
        <img
          src={tableIllustration}
          alt="Dining Illustration"
          style={styles.illustration}
        />
        <button onClick={handleReservationClick} style={styles.button}>
          Make a Reservation
        </button>
      </div>

      <h3 style={styles.orText}>or</h3>

      <div style={styles.orderSection}>
        <button onClick={handleStartOrderingClick} style={{...styles.button, backgroundColor: '#4CAF50'}}>
          🍽️ Start Ordering Now
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    maxWidth: '500px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginBottom: '30px',
  },
  qrImage: {
    width: '40%',
    maxWidth: '140px',
    marginBottom: '16px',
  },
  illustrationSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  illustration: {
    width: '80%',
    maxWidth: '320px',
    marginBottom: '16px',
  },
  button: {
    backgroundColor: '#f4c430',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '300px',
    marginBottom: '20px',
  },
  orText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#000',
    margin: '20px 0',
  },
};

export default Welcome;
