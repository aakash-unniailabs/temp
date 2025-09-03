import React from "react";
import { Row, Col, Card, Container } from "react-bootstrap";
import "./ItemList.css";

const BASE_URL = "http://localhost:4000";

function ItemList({ items, onAddToCart }) {
  if (items.length === 0) {
    return (
      <Container className="text-center py-5 item-list-container">
        <div className="no-items-icon">🍽️</div>
        <p className="mt-2">No items found in this category.</p>
      </Container>
    );
  }

  const handleAddToCart = (item, e) => {
    e.stopPropagation();
    const cartIcon = document.getElementById("cart-icon");
    const itemImage = e.currentTarget.closest(".item-card")?.querySelector("img");

    if (itemImage && cartIcon) {
      const imgClone = itemImage.cloneNode(true);
      const rect = itemImage.getBoundingClientRect();

      imgClone.style.position = "fixed";
      imgClone.style.left = rect.left + "px";
      imgClone.style.top = rect.top + "px";
      imgClone.style.width = rect.width + "px";
      imgClone.style.height = rect.height + "px";
      imgClone.style.transition = "all 0.8s ease-in-out";
      imgClone.style.zIndex = 1000;
      document.body.appendChild(imgClone);

      const cartRect = cartIcon.getBoundingClientRect();
      setTimeout(() => {
        imgClone.style.left = cartRect.left + "px";
        imgClone.style.top = cartRect.top + "px";
        imgClone.style.width = "20px";
        imgClone.style.height = "20px";
        imgClone.style.opacity = "0.3";
      }, 50);

      setTimeout(() => {
        document.body.removeChild(imgClone);
        onAddToCart(item, e);
      }, 850);
    } else {
      onAddToCart(item, e);
    }
  };

  return (
    <Container fluid className="item-list-container">
      <Row xs={1} className="g-3">
        {items.map((item) => {
          const imageName = item.image_url || item.photoUrl;
          const imageSrc = imageName ? `${BASE_URL}/uploads/menus/${imageName}` : null;

          return (
            <Col key={item.id}>
              <Card className="item-card">
                <div className="d-flex w-100 align-items-center justify-content-between">
                  {/* 🖼️ Image */}
                  <div className="item-image-container">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={item.name}
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/120")
                        }
                        className="item-image"
                      />
                    ) : (
                      <span style={{ fontSize: "1.5rem" }}>🍽️</span>
                    )}
                  </div>

                  {/* 📄 Details */}
                  <div className="item-details">
                    <h5 className="item-name">{item.name}</h5>
                    <p className="item-description mb-1">
                      {item.description || "Fresh vegetables & mozzarella"}
                    </p>
                    <span className="item-price">
                      ₹ {parseFloat(item.price).toFixed(2)}
                    </span>
                  </div>

                  {/* ➕ Add Button (Round Red Circle) */}
                  <div
                    className="add-btn"
                    onClick={(e) => handleAddToCart(item, e)}
                  >
                    <span className="plus-icon">+</span>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

export default ItemList;
