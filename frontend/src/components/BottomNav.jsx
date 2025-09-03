import * as React from 'react';
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.js';
import { useReservation } from '../context/ReservationContext.jsx';

// SVGs as React components
import { ReactComponent as HomeIcon } from '../assets/homeicon.svg';
import { ReactComponent as OrdersIcon } from '../assets/ordericon.svg';
import { ReactComponent as FavoriteIcon } from '../assets/reservationicon.svg';
import { ReactComponent as CartIcon } from '../assets/carticon.svg';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = React.useState(location.pathname);
  const { getTotalItems } = useCart();
  const { currentReservation, isUpcomingReservation } = useReservation();
  const totalItems = getTotalItems();

  React.useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);

    if (newValue === '/reservation') {
      handleReservationNavigation();
    } else {
      navigate(newValue);
    }
  };

  const handleReservationNavigation = () => {
    if (currentReservation && isUpcomingReservation(currentReservation)) {
      navigate('/reservation-details', {
        state: { reservationData: currentReservation }
      });
    } else {
      navigate('/reservation');
    }
  };

  const iconSize = 36; // bigger icons for Figma design

  const iconWrapper = (IconComponent, isActive) => (
    <Box
      sx={{
        width: iconSize,
        height: iconSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& svg': {
          width: '100%',
          height: '100%',
          fill: isActive ? '#FFD369' : '#000',
        },
      }}
    >
      <IconComponent />
    </Box>
  );

  return (
    <Paper
      sx={{
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        overflow: 'hidden',
        width: '100%',        // ✅ take full width
        maxWidth: '440px',    // ✅ Figma design limit
        height: '99px',       // ✅ fixed height as per design
        margin: '40px auto',  // ✅ center horizontally
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels={false}
        value={value}
        onChange={handleChange}
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '100%',
          paddingX: 1,
        }}
      >
        <BottomNavigationAction
          value="/home"
          icon={iconWrapper(HomeIcon, value === '/home')}
          sx={{ minWidth: 0 }}
        />

        <BottomNavigationAction
          value="/orders"
          icon={iconWrapper(OrdersIcon, value === '/orders')}
          sx={{ minWidth: 0 }}
        />

        <BottomNavigationAction
          value="/reservation"
          icon={
            <Box sx={{ position: 'relative' }}>
              {iconWrapper(FavoriteIcon, value === '/reservation')}
              {currentReservation && isUpcomingReservation(currentReservation) && (
                <Box
                  sx={{
                     position: 'fixed',
                    top: -2,
                    right: -2,
                    width: 10,
                    height: 10,
                    backgroundColor: '#4CAF50',
                    borderRadius: '50%',
                    border: '2px solid white',
                  }}
                />
              )}
            </Box>
          }
          sx={{ minWidth: 0 }}
        />

        <BottomNavigationAction
          value="/cart"
          icon={
            <Box sx={{ position: 'relative' }}>
              {iconWrapper(CartIcon, value === '/cart')}
              {totalItems > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -6,
                    right: -10,
                    fontSize: '0.65rem',
                    color: 'white',
                    backgroundColor: 'red',
                    borderRadius: '50%',
                    px: '5px',
                    py: '2px',
                    minWidth: '18px',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {totalItems}
                </Box>
              )}
            </Box>
          }
          sx={{ minWidth: 0 }}
        />
      </BottomNavigation>
    </Paper>
  );
}
