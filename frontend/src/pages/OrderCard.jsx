// src/pages/OrderCard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../context/OrderContext.js";
import "./OrderConfirmation.css";

function OrderCard() {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const [rating, setRating] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(20);
  const [latestOrder, setLatestOrder] = useState(null);

  // Load order from context OR localStorage
  useEffect(() => {
    if (orders.length > 0) {
      setLatestOrder(orders[0]);
      localStorage.setItem("latestOrder", JSON.stringify(orders[0]));
    } else {
      const savedOrder = localStorage.getItem("latestOrder");
      if (savedOrder) {
        try {
          setLatestOrder(JSON.parse(savedOrder));
        } catch (e) {
          console.warn("Saved order is invalid JSON");
        }
      }
    }
  }, [orders]);

  // Timer for estimated time
  useEffect(() => {
    if (estimatedTime > 0 && latestOrder) {
      const timer = setTimeout(() => setEstimatedTime((prev) => prev - 1), 60000);
      return () => clearTimeout(timer);
    }
  }, [estimatedTime, latestOrder]);

  const handleRating = (stars) => setRating(stars);
  const handleContactSupport = () => alert("Contacting support...");

  if (!latestOrder) {
    return (
      <div className="order-confirmation-page">
        {/* Header without back button */}
        <div className="confirmation-header">
          <h2 className="header-title">Order Details</h2>
        </div>

        {/* Empty order message */}
        <div className="empty-cart">
          <div className="empty-cart-icon">📋</div>
          <h3>No orders yet</h3>
          <p>Place your first order to see it here!</p>
        </div>
      </div>
    );
  }

  const subtotal = latestOrder.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.05);
  const serviceFee = 12;
  const total = subtotal + tax + serviceFee;

  return (
    <div className="order-confirmation-page">
      {/* Header without back button */}
      <div className="confirmation-header">
        <h2 className="header-title">Order Details</h2>
      </div>

      {/* Success Message */}
      <div className="success-section">
        <div className="success-icon">✅</div>
        <h2 className="success-title">Order Placed Successfully!</h2>
        <p className="success-message">
          Your order is being prepared. We'll notify you when it's ready.
        </p>
      </div>

      {/* Customer Info */}
      <div className="info-card">
        <p><strong>Customer:</strong> {latestOrder.customerName || "Guest"}</p>
      </div>

      {/* Order Details */}
      <div className="info-card">
        <div className="order-info-row">
          <div>
            <span className="info-label">Order Number</span>
            <p className="info-value">#{latestOrder.orderId}</p>
          </div>
          <div>
            <span className="info-label">Estimated Time</span>
            <p className="info-value estimated-time">
              {estimatedTime > 0 ? `${estimatedTime} min` : "Ready!"}
            </p>
          </div>
        </div>

        <div className="order-info-row">
          <div>
            <span className="info-label">Table</span>
            <p className="info-value">{latestOrder.tableNumber}</p>
          </div>
          <div>
            <span className="info-label">Waiter</span>
            <p className="info-value">{latestOrder.waiter}</p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="info-card">
        <h3 className="section-title">Order Summary</h3>
        <div className="order-items">
          {latestOrder.items.map((item, index) => (
            <div key={index} className="order-item">
              <div className="item-details">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">x{item.quantity}</span>
              </div>
              <span className="item-price">
                ₹ {(item.price * item.quantity).toFixed(0)}
              </span>
            </div>
          ))}
        </div>

        <div className="bill-breakdown">
          <div className="bill-row">
            <span>Subtotal</span>
            <span>₹ {subtotal.toFixed(0)}</span>
          </div>
          <div className="bill-row">
            <span>Tax (5%)</span>
            <span>₹ {tax}</span>
          </div>
          <div className="bill-row">
            <span>Service Fee</span>
            <span>₹ {serviceFee}</span>
          </div>
          <div className="bill-row total-row">
            <strong>Total</strong>
            <strong>₹ {total.toFixed(0)}</strong>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="info-card">
        <h3 className="section-title">Payment Method</h3>
        <p className="payment-type">{latestOrder.paymentMethod || "Cash"}</p>
      </div>

      {/* Rating Section */}
      <div className="info-card">
        <h3 className="section-title">Rate Your Experience</h3>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`star-btn ${rating >= star ? "active" : ""}`}
              onClick={() => handleRating(star)}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="contact-support-wrapper">
        <button className="contact-support-btn" onClick={handleContactSupport}>
          Contact Support
        </button>
      </div>
    </div>
  );
}

export default OrderCard;
