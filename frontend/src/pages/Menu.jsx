// src/pages/Menu.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  InputGroup,
  Form,
  Button,
} from "react-bootstrap";
import { getCategories, getItemsByCategory } from "../api/menuApi";
import ItemList from "../components/ItemList";
import { useCart } from "../context/CartContext";
import "./Menu.css";

const BASE_URL = "http://localhost:4000";

function Menu() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { addToCart } = useCart();

  // 🔹 Fetch categories
  useEffect(() => {
    getCategories()
      .then((cats) => {
        const updatedCats = cats.map((cat) => ({
          ...cat,
          photoUrl: cat.photo ? `${BASE_URL}/uploads/menus/${cat.photo}` : null,
        }));
        setCategories(updatedCats);
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  // 🔹 Fetch items when category changes
  useEffect(() => {
    if (!selectedCategoryId) return;

    setLoadingItems(true);
    getItemsByCategory(selectedCategoryId)
      .then((fetchedItems) => {
        const updatedItems = fetchedItems.map((item) => ({
          ...item,
          photoUrl: item.image_url
            ? `${BASE_URL}/uploads/items/${item.image_url}`
            : null,
          price: parseFloat(item.price) || 0,
        }));
        setItems(updatedItems);
        setAllItems(updatedItems);
      })
      .catch((err) => console.error("Failed to fetch items:", err))
      .finally(() => setLoadingItems(false));
  }, [selectedCategoryId]);

  // 🔹 Search filter
  useEffect(() => {
    const filtered = searchQuery.trim()
      ? allItems.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allItems;
    setItems(filtered);
  }, [searchQuery, allItems]);

  // 🔹 Handlers
  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleAddToCart = (item) => addToCart(item);
  const handleCategoryClick = (cat) => setSelectedCategoryId(cat.id);
  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setItems([]);
    setAllItems([]);
    setSearchQuery("");
  };

  return (
    <Container fluid className="menu-page py-3">
      {/* 🔍 Search Bar (only on category list) */}
      {!selectedCategoryId && (
        <Row className="justify-content-center mb-3">
          <Col xs={12} sm={10} md={8} lg={6}>
            <InputGroup className="custom-search-bar">
              <InputGroup.Text>🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <InputGroup.Text>🎤</InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>
      )}

      {/* 📂 Categories OR Items */}
      {!selectedCategoryId ? (
        <Row>
          {categories.map((cat) => (
            <Col
              key={cat.id}
              xs={6}
              sm={6}
              md={6}
              lg={6}
              className="mb-3"
              onClick={() => handleCategoryClick(cat)}
              style={{ cursor: "pointer" }}
            >
              <div
                className="category-card text-center shadow-sm p-2"
                style={{
                  borderRadius: "14px",
                  transition: "transform 0.2s",
                  backgroundColor: "white",
                  minHeight: "180px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.04)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {cat.photoUrl && (
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      margin: "0 auto 6px",
                      overflow: "hidden",
                      backgroundColor: "#f8f9fa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    <img
                      src={cat.photoUrl}
                      alt={cat.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                <h6 className="fw-semibold mb-1" style={{ fontSize: "1rem" }}>
                  {cat.name}
                </h6>
                <small className="text-muted" style={{ fontSize: "0.85rem" }}>
                  {cat.item_count} Items
                </small>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <Row>
          <Col xs={12}>
            {/* ⬅ Back Button */}
            <Button
              variant="outline-secondary"
              size="sm"
              className="mb-3"
              onClick={handleBackToCategories}
            >
              ⬅ Back to Categories
            </Button>

            {loadingItems ? (
              <div className="text-center my-4">
                <Spinner animation="border" variant="primary" />
                <div>Loading items...</div>
              </div>
            ) : (
              <ItemList items={items} onAddToCart={handleAddToCart} />
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Menu;
