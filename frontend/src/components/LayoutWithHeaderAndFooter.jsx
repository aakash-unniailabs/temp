// src/components/LayoutWithHeaderAndFooter.jsx
import React from "react";
import { useLocation, Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./BottomNav.jsx";

const LayoutWithHeaderAndFooter = () => {
  const location = useLocation();

  const hideHeaderRoutes = ["/scan"];
  const hideFooterRoutes = ["/", "/welcome", "/auth"];

  const showHeader = !hideHeaderRoutes.includes(location.pathname);
  const showFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {showHeader && <Header />}

      {/* Main Content */}
      <div className="flex-grow-1 p-3">
        <Outlet />
      </div>

      {showFooter && <Footer />}
    </div>
  );
};

export default LayoutWithHeaderAndFooter;
