import React, { useState } from "react";
import { Form, Button, InputGroup, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useReservation } from "../context/ReservationContext";
import axios from "axios";
import reservationImage from "../assets/reservation.png";
import "../pages/TableManager.css";

const ADMIN_BACKEND_URL = "http://localhost:4000";
const CUSTOMER_BACKEND_URL = "http://localhost:5000";

const ReservationForm = ({ token }) => {
  const navigate = useNavigate();
  const { saveReservation } = useReservation();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [message, setMessage] = useState("");
  const [navigating, setNavigating] = useState(false);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleNextToTime = () => {
    if (!date) return showMessage(" Please select a date");
    setStep(2);
  };

  const handleNextToTables = async () => {
    if (!time) return showMessage(" Please select a time");

    setLoadingTables(true);
    try {
      const res = await axios.get(`${ADMIN_BACKEND_URL}/api/table`);
      setTables(Array.isArray(res.data.tables) ? res.data.tables : []);
      setStep(3);
    } catch (err) {
      console.error("Error fetching tables:", err.message);
      showMessage("❌ Failed to load tables. Please try again.");
    } finally {
      setLoadingTables(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authToken = token || localStorage.getItem("token");

    if (!date || !time || !authToken || !selectedTable) {
      return showMessage(" Missing date, time, table, or token");
    }

    setLoadingSubmit(true);
    try {
      const res = await axios.post(
        `${CUSTOMER_BACKEND_URL}/api/reservation`,
        { date, time, table_id: selectedTable },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const reservationData = res.data.reservation;
      setNavigating(true);
      saveReservation(reservationData);

      navigate("/reservation-confirmation", {
        state: { reservationData },
        replace: true,
      });
      return;
    } catch (err) {
      console.error("Reservation error:", err.response?.data || err.message);

      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Reservation failed";

      if (err.response?.status === 401 || errorMessage.toLowerCase().includes("token")) {
        showMessage(` Authentication failed. Please log in again.`);
      } else {
        showMessage(` ${errorMessage}`);
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="reservation-form-container">
      {step !== 3 && (
        <>
          <div style={{ textAlign: "center" }}>
            <img src={reservationImage} alt="Reservation" className="intro-image" />
          </div>
          <h2 style={{ fontSize: "2rem", textAlign: "center" }}>Reserve a Table</h2>
          <p style={{ marginBottom: "2rem", fontSize: "1rem", textAlign: "center", color: "#666" }}>
            Select your date, time & preferred table.
          </p>
        </>
      )}

      {message && (
        <Alert variant={message.startsWith("✅") ? "success" : "danger"} style={{ marginBottom: "1rem" }}>
          {message}
        </Alert>
      )}

      {/* Step 1: Date */}
      {step === 1 && (
        <div>
          <Form.Group className="mb-4">
            <Form.Label>Select Date</Form.Label>
            <InputGroup>
              <InputGroup.Text>📅</InputGroup.Text>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>
          <Button
            onClick={handleNextToTime}
            className="w-100 btn-primary-custom"
            disabled={!date}
          >
            Next
          </Button>
        </div>
      )}

      {/* Step 2: Time */}
      {step === 2 && (
        <div>
          <Form.Group className="mb-4">
            <Form.Label>Select Time</Form.Label>
            <InputGroup>
              <InputGroup.Text>⏰</InputGroup.Text>
              <Form.Control
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>
          <Button
            onClick={handleNextToTables}
            className="w-100 btn-primary-custom"
            disabled={!time || loadingTables}
          >
            {loadingTables ? <Spinner animation="border" size="sm" /> : "Next"}
          </Button>
        </div>
      )}

      {/* Step 3: Tables */}
      {step === 3 && (
        <Form onSubmit={handleSubmit}>
          <h4 style={{ marginBottom: "20px", color: "#333", fontWeight: "600", textAlign: "center" }}>
            Now it’s time to choose your table
          </h4>

          {loadingTables ? (
            <p className="text-center text-muted">Loading tables...</p>
          ) : tables.length > 0 ? (
            <div className="table-grid">
              {tables.map((t) => {
                const isAvailable = t.status?.toLowerCase() === "available";
                const isSelected = selectedTable === t.id;
                return (
                  <div
                    key={t.id}
                    className={`table-card-visual ${t.status?.toLowerCase() || "available"} ${isSelected ? "selected" : ""}`}
                    onClick={() => isAvailable && setSelectedTable(t.id)}
                    style={{ cursor: isAvailable ? "pointer" : "not-allowed" }}
                  >
                    <div className="table-icon">
                      <div className="table-center">
                        {t.label || `T${t.table_number}`}
                        <div className="capacity">
                          {t.seating_capacity} Seats
                        </div>
                      </div>
                    </div>
                    <div className="table-info">
                      <span className={`status-badge ${t.status?.toLowerCase() || "available"}`}>
                        {t.status || "Available"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted">No tables available.</p>
          )}

          <Button
            type="submit"
            className="w-100 mt-4 btn-primary-custom"
            disabled={!selectedTable || loadingSubmit || navigating}
          >
            {navigating ? (
              <>
                <Spinner animation="border" size="sm" /> Redirecting...
              </>
            ) : loadingSubmit ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Confirm Reservation"
            )}
          </Button>
        </Form>
      )}
    </div>
  );
};

export default ReservationForm;
