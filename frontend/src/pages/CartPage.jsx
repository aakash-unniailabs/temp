

import React, { useState, useEffect, useContext } from "react";
import { useCart } from "../context/CartContext.js";
import { useOrders } from "../context/OrderContext.js";
import { useNavigate } from "react-router-dom";
import { submitOrderToAdmin } from "../api/orderApi.js";
import { AuthContext } from "../context/AuthContext.js";
import ProtectedCheckout from "../components/ProtectedCheckout.jsx";
import axios from "axios";
import { ReactComponent as CartIcon } from "../assets/carticon.svg";
import "./Cart.css";

const BASE_URL = "http://localhost:4000";

function CartPage() {
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  const { user } = useContext(AuthContext);
  const [showCheckout, setShowCheckout] = useState(false);
  const {
    cartItems: items,
    paymentMethod,
    getTotalPrice,
    updateQuantity,
    removeFromCart,
    setPaymentMethod,
    clearCart,
  } = useCart();

  const [customerName, setCustomerName] = useState("Guest");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const paymentMethods = ["Cash", "Card", "UPI", "Online"];

  //  Load customer name from AuthContext or API

  useEffect(() => {
    if (user?.name) {
      setCustomerName(user.name);
      return;
    }
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get(`${BASE_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.name) setCustomerName(res.data.name);
      } catch {
        setCustomerName("Guest");
      }
    };
    fetchUser();
  }, [user]);

  //  Quantity update

  const handleQuantityChange = (itemId, newQty) => {
    if (newQty === 0) removeFromCart(itemId);
    else updateQuantity(itemId, newQty);
  };

  //  Confirm order
  const handleConfirmOrder = async () => {
    if (!paymentMethod) return alert("Please select a payment method");

    const orderId = "#" + Math.floor(Math.random() * 90000 + 10000);

    const orderData = {
      orderId,
      id: orderId,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      paymentMethod,
      waiter: "Sophia",
      total: getTotalPrice(),
      customerName: customerName || "Guest",
      timestamp: new Date().toISOString(),
    };

    try {
      const savedOrder = addOrder(orderData);
      await submitOrderToAdmin(savedOrder);
      clearCart();
      navigate("/orders", { replace: true });
    } catch {
      const savedOrder = addOrder(orderData);
      clearCart();
      navigate("/orders", { replace: true });
      setTimeout(() => {
        alert("Order placed! But there was an issue syncing with admin system.");
      }, 1000);
    }
  };

  return (
    <div
      className="cart-page"
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "16px",
        paddingBottom: "80px",  //  extra space for bottom nav
      }}
    >
      {/*  Sirf naam show karna hai */}
      <h2 className="customer-name mb-4 text-center text-dark fw-semibold">
        {customerName}
      </h2>

      {items.length === 0 ? (
        <div className="empty-cart text-center py-5">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-light shadow-sm"
            style={{ width: "96px", height: "96px", margin: "0 auto" }}
          >
            <CartIcon style={{ width: "60%", height: "60%", fill: "#ccc" }} />
          </div>
          <h3 className="mt-3">Your cart is empty</h3>
          <p className="text-muted">Add some delicious items to get started!</p>
          <button
            className="browse-menu-btn btn btn-warning mt-2"
            onClick={() => navigate("/home")}
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          <h2 className="section-title mb-3">Order Summary</h2>
          <div className="cart-items">
            {items.map((item) => {
              const imageSrc =
                item.image_url || item.photoUrl
                  ? `${BASE_URL}/uploads/menus/${item.image_url || item.photoUrl}`
                  : null;

              return (
                <div
                  key={item.id}
                  className="cart-item d-flex align-items-center mb-3 p-2 rounded shadow-sm bg-white"
                >
                  <div
                    className="cart-item-image bg-light d-flex align-items-center justify-content-center shadow-sm"
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/60")
                        }
                      />
                    ) : (
                      <span style={{ fontSize: "1.5rem" }}>🍽️</span>
                    )}
                  </div>

                  <div className="ms-3 flex-grow-1">
                    <h5
                      className="mb-1 fw-semibold"
                      style={{ fontSize: "1rem" }}
                    >
                      {item.name}
                    </h5>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <button
                          className="quantity-btn btn btn-outline-secondary btn-sm rounded-circle"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                        >
                          -
                        </button>
                        <span
                          className="px-2 text-dark fw-medium"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          className="quantity-btn btn btn-outline-secondary btn-sm rounded-circle"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <div
                        className="fw-semibold text-dark"
                        style={{ fontSize: "0.95rem" }}
                      >
                        ₹ {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment */}
          <div className="payment-section mt-3">
            <h3 className="section-title">Payment Method</h3>
            <button
              className="payment-selector w-100 btn btn-outline-dark d-flex justify-content-between align-items-center"
              onClick={() => setShowPaymentModal(true)}
            >
              {paymentMethod || "Select Payment"}{" "}
              <span className="arrow">→</span>
            </button>
          </div>

          {/* Total */}
          <div className="total-section mt-4 p-3 rounded shadow-sm bg-light">
            <div className="d-flex justify-content-between fw-semibold">
              <span className="total-label">Total</span>
              <span className="total-amount text-success">
                ₹ {getTotalPrice().toFixed(2)}
              </span>
            </div>
          </div>

          <button
            className="confirm-order-btn w-100 mt-3 btn btn-warning fw-semibold shadow-sm"
            onClick={() => setShowCheckout(true)}
          >
            Confirm Order
          </button>
        </>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Select Payment Method</h3>
            <div className="payment-options">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  className={`payment-option ${
                    paymentMethod === method ? "selected" : ""
                  }`}
                  onClick={() => {
                    setPaymentMethod(method);
                    setShowPaymentModal(false);
                  }}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Protected Checkout Modal */}
      {showCheckout && (
        <div
          className="modal-overlay"
          onClick={() => setShowCheckout(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <ProtectedCheckout
              onAuthSuccess={(customer) => {
                console.log("User authenticated:", customer);
                setCustomerName(customer?.name || "Guest");
                setShowCheckout(false);
                handleConfirmOrder();
              }}
            >
              <div className="checkout-success text-center">
                <h3> Ready to Place Order</h3>
                <div className="user-info my-3">
                  <p>
                    You are logged in as{" "}
                    <span className="user-name fw-semibold">
                      {user?.name || customerName}
                    </span>
                  </p>
                </div>
                <button
                  className="confirm-order-btn btn btn-warning fw-semibold w-100"
                  onClick={() => {
                    setShowCheckout(false);
                    handleConfirmOrder();
                  }}
                >
                  Place Order Now
                </button>
                <button
                  className="btn btn-outline-secondary w-100 mt-2"
                  onClick={() => setShowCheckout(false)}
                >
                  Cancel
                </button>
              </div>
            </ProtectedCheckout>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
