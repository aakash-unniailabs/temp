import axios from 'axios';

export const reserveTable = async (date, time, token) => {
  return await axios.post(
    'http://localhost:5000/api/reserve', // 👈 Full URL bypasses proxy
    { date, time },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
};
