import React, { useContext } from 'react';
import ReservationForm from '../components/ReservationForm';
import { AuthContext } from '../context/AuthContext';

const Reserve = () => {
  const { token } = useContext(AuthContext);

  return (
    <div className="reserve-page">
      <ReservationForm token={token} />
    </div>
  );
};

export default Reserve;
