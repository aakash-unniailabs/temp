// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CartProvider } from './context/CartContext.js';
import { OrderProvider } from './context/OrderContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { ReservationProvider } from './context/ReservationContext.jsx';

// Pages
import Auth from './components/Auth.jsx';
import Menu from './pages/Menu.jsx';
import CartPage from './pages/CartPage.jsx';
import OrderCard from './pages/OrderCard.jsx';
import ReservationConfirmation from './pages/ReservationConfirmation.jsx';
import ReservationDetails from './pages/ReservationDetails.jsx';
import ScanRedirect from './pages/ScanRedirect.jsx';
import Welcome from './pages/Welcome.jsx';
import ReservePage from './pages/Reserve.jsx';

// Layout
import LayoutWithHeaderAndFooter from './components/LayoutWithHeaderAndFooter.jsx';

// Styles
import './Auth.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <OrderProvider>
          <CartProvider>
            <ReservationProvider>
              <BrowserRouter>
                <Routes>
                  {/* Entry points - no header/footer */}
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/auth" element={<Auth />} />

                  {/* Redirect root ("/") to /home */}
                  <Route path="/" element={<Navigate to="/home" replace />} />

                  {/* Main app routes - with header/footer */}
                  <Route element={<LayoutWithHeaderAndFooter />}>
                    <Route path="/home" element={<Menu />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/orders" element={<OrderCard />} />
                    <Route path="/scan" element={<ScanRedirect />} />
                    <Route path="/reservation" element={<ReservePage />} />
                    <Route path="/reservation-confirmation" element={<ReservationConfirmation />} />
                    <Route path="/reservation-details" element={<ReservationDetails />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </ReservationProvider>
          </CartProvider>
        </OrderProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
