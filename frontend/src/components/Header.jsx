// src/components/Header.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const pageMap = {
    "/cart": "Your Cart",
    "/orders": "Orders",
    "/reservation": "Reservation",
    "/reservation-confirmation": "Confirmation",
    "/reservation-details": "Reservation Details",
    "/order-details": "Order Details",
  };

  let pageTitle = "Menu";
  let showBack = true;

  if (location.pathname === "/home") {
    // Home page
    pageTitle = "Menu";
    showBack = false;
  } else if (location.pathname.startsWith("/home/")) {
    // Category page
    const category = location.pathname.split("/")[2];
    pageTitle = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize
    showBack = true;
  } else {
    // Other pages
    pageTitle = pageMap[location.pathname] || "App";
    showBack = true;
  }

  return (
    <div style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb" }}>
      {/* 🔝 Top Row: Back Button + Title */}
      <div
        style={{
          padding: "12px 16px 0px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* 🔙 Back Button (sirf jab showBack true ho) */}
        {showBack ? (
          <span
            role="button"
            onClick={() => navigate(-1)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              fontSize: "22px",
              cursor: "pointer",
              backgroundColor: isHovered ? "#ffd369" : "transparent",
              padding: "2px 6px",
              borderRadius: "4px",
              transition: "background-color 0.3s ease-in-out",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ←
          </span>
        ) : (
          <div style={{ width: "22px" }} /> 
        )}

        {/* 🏷️ Title */}
        <h5
          className="m-0 fw-semibold text-dark text-center flex-grow-1"
          style={{ textAlign: "center" }}
        >
          {pageTitle}
        </h5>

        {/* Spacer */}
        <div style={{ width: "22px" }} />
      </div>

      {/* 🟡 Yellow Underline (content width only, no side gaps) */}
      <div
        style={{
          height: "3px",
          backgroundColor: "#f4c542",
          marginTop: "6px",
          borderRadius: "2px",
          width: "100%", 
        }}
      ></div>
    </div>
  );
};

export default Header;
