// src/pages/AddOrder.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import OrderConfirmationModal from "../components/OrderConfirmationModal";

const customStyles = `
.card-item {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border-radius: 1rem;
  overflow: hidden;
}
.card-item:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
}
.cart-card {
  border-radius: 1rem;
  padding: 1.5rem;
  background: #fff;
}
.btn-primary-custom {
  background: linear-gradient(135deg, #007bff, #0056b3);
  border: none;
  transition: all 0.3s ease;
}
.btn-primary-custom:hover {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}
.list-group-item-custom {
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem 1rem;
}
.heading-gradient {
  background: linear-gradient(90deg, #ff9800, #f44336);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
`;

const AddOrder = () => {
  const { darkMode } = useTheme();
  const { user } = useContext(AuthContext);
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [newOrder, setNewOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);

    const fetchMenuItems = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/menu-items");
        const itemsWithFullImageUrl = response.data.map((item) => ({
          ...item,
          image_url: item.image_url
            ? `http://localhost:4000/uploads/menus/${item.image_url}`
            : null,
        }));
        setMenuItems(itemsWithFullImageUrl);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };
    fetchMenuItems();
  }, []);

  const handleAddItem = (item) => {
    const existing = cart.find((ci) => ci.item_id === item.id);
    if (existing) {
      setCart(
        cart.map((ci) =>
          ci.item_id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      );
    } else {
      setCart([
        ...cart,
        { item_id: item.id, name: item.name, price: item.price, quantity: 1 },
      ]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setCart(cart.filter((ci) => ci.item_id !== itemId));
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Please add items to your order.");
      return;
    }
    try {
      const totalAmount = cart.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      const response = await axios.post("http://localhost:4000/api/orders", {
        customer_name: user?.name || "Guest",
        table_number: tableNumber ? parseInt(tableNumber, 10) : null,
        items: cart,
        total_amount: totalAmount,
        order_type: "Customer",
        status: "Placed",
      });
      setNewOrder(response.data.order);
      setShowModal(true);
      setCart([]);
      setTableNumber("");
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Try again.");
    }
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const themeClass = darkMode ? "bg-dark text-light" : "bg-light text-dark";
  const cardThemeClass = darkMode
    ? "bg-secondary text-light"
    : "bg-white text-dark";
  const inputClass = darkMode
    ? "bg-secondary text-light"
    : "bg-white text-dark";
  const listGroupItemClass = darkMode
    ? "bg-dark text-light border-secondary"
    : "bg-light text-dark border-light";

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className={`container py-5 ${themeClass}`}>
      {/* Page Heading */}
      <h1 className="text-center fw-bold mb-5 heading-gradient">
         Place Your Order 🛒
      </h1>

      {/* Search + Table Select */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-6">
          <select
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className={`form-select form-control-lg rounded-3 shadow-sm ${inputClass}`}
          >
            <option value="">Select Table Number (Optional)</option>
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Table {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6">
          <input
            type="text"
            placeholder="🔍 Search for a dish..."
            className={`form-control form-control-lg rounded-3 shadow-sm ${inputClass}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Menu Items */}
      <h2 className="mb-4">🍽️ Menu Items</h2>
      <div className="row g-4 mb-5">
        {filteredItems.map((item) => (
          <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div
              className={`card h-100 shadow-sm card-item ${cardThemeClass}`}
            >
              <div
                className="w-100 d-flex justify-content-center align-items-center bg-light"
                style={{
                  height: "180px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <img
                  src={item.image_url || "https://via.placeholder.com/300"}
                  alt={item.name}
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="card-body text-center d-flex flex-column justify-content-between">
                <div>
                  <h5 className="card-title fw-bold">{item.name}</h5>
                  <p className="card-text text-muted mb-2">₹{item.price}</p>
                </div>
                <button
                  className="btn btn-outline-primary mt-3"
                  onClick={() => handleAddItem(item)}
                >
                  ➕ Add ({cart.find((ci) => ci.item_id === item.id)?.quantity || 0})
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart */}
      <h2 className="mb-4">🛒 Your Cart</h2>
      <div className={`cart-card ${cardThemeClass} shadow-sm`}>
        {cart.length === 0 ? (
          <div className="text-center p-4">
            <p className="lead text-muted">🛍️ Your cart is empty. Add some delicious food!</p>
          </div>
        ) : (
          <div>
            <ul className="list-group list-group-flush mb-3">
              {cart.map((ci) => (
                <li
                  key={ci.item_id}
                  className={`list-group-item d-flex justify-content-between align-items-center ${listGroupItemClass} list-group-item-custom`}
                >
                  <span>
                    <span className="fw-bold">{ci.name}</span> × {ci.quantity}
                  </span>
                  <span className="fw-bold">
                    ₹{(ci.price * ci.quantity).toFixed(2)}
                    <button
                      className="btn btn-sm btn-outline-danger ms-3"
                      onClick={() => handleRemoveItem(ci.item_id)}
                    >
                      ❌
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <h4 className="fw-bold m-0">Total:</h4>
              <h4 className="fw-bold text-success m-0">₹{cartTotal.toFixed(2)}</h4>
            </div>
          </div>
        )}
      </div>

      {/* Place Order Button */}
      <button
        className="btn btn-primary w-100 py-3 mt-4 btn-primary-custom"
        onClick={placeOrder}
        disabled={cart.length === 0}
      >
        🚀 Place Order
      </button>

      {/* Confirmation Modal */}
      {newOrder && (
        <OrderConfirmationModal
          show={showModal}
          onHide={() => setShowModal(false)}
          order={newOrder}
          onCancel={() => setShowModal(false)}
          onComplete={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AddOrder;
