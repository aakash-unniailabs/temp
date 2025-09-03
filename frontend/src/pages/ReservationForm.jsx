import React, { useState } from "react";
import { Form, Button, InputGroup, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useReservation } from "../context/ReservationContext";
import axios from "axios";
import reservationImage from "../assets/reservation.png";
import "./TableManager.css";

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
    if (!date) return showMessage("⚠️ Please select a date");
    setStep(2);
  };

  const handleNextToTables = async () => {
    if (!time) return showMessage("⚠️ Please select a time");

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
      return showMessage("⚠️ Missing date, time, table, or token");
    }

    setLoadingSubmit(true);
    try {
      const res = await axios.post(
        `${CUSTOMER_BACKEND_URL}/api/reservation`,
        { date, time, table_id: selectedTable },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const reservationData = res.data.reservation;
      console.log("🎉 RESERVATION SUCCESS! Navigating immediately...");

      setNavigating(true);
      saveReservation(reservationData);

      navigate("/reservation-confirmation", {
        state: { reservationData },
        replace: true,
      });
    } catch (err) {
      console.error("Reservation error:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Reservation failed";
      showMessage(`❌ ${errorMessage}`);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="reservation-form-container shadow">
      {(step === 1 || step === 2) && (
        <>
          <img
            src={reservationImage}
            alt="Reservation"
            className="intro-image"
          />
          <h2 className="text-center mb-2" style={{ fontWeight: "700", color: "#333" }}>
            Reserve a Table
          </h2>
          <p className="text-center mb-4" style={{ color: "#666" }}>
            Select your date, time & preferred table.
          </p>
        </>
      )}

      {message && (
        <Alert
          variant={message.startsWith("✅") ? "success" : "danger"}
          style={{ marginBottom: "16px", fontSize: "0.95rem" }}
        >
          {message}
        </Alert>
      )}

      {step === 1 && (
        <div>
          <Form.Group className="mb-3 text-start">
            <Form.Label>Select Date</Form.Label>
            <InputGroup>
              <InputGroup.Text style={{ background: "#FFD369", color: "#fff" }}>
                📅
              </InputGroup.Text>
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
            className="btn-custom w-100"
            disabled={!date}
          >
            Next
          </Button>
        </div>
      )}

      {step === 2 && (
        <div>
          <Form.Group className="mb-3 text-start">
            <Form.Label>Select Time</Form.Label>
            <InputGroup>
              <InputGroup.Text style={{ background: "#FFD369", color: "#fff" }}>
                ⏰
              </InputGroup.Text>
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
            className="btn-custom w-100"
            disabled={!time || loadingTables}
          >
            {loadingTables ? <Spinner animation="border" size="sm" /> : "Next"}
          </Button>
        </div>
      )}

      {step === 3 && (
        <Form onSubmit={handleSubmit}>
          <h4 className="mb-4" style={{ fontWeight: "600", color: "#333" }}>
            Now it’s time to choose your table
          </h4>

          {loadingTables ? (
            <p className="text-center text-muted">Loading tables...</p>
          ) : tables.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-2 g-4">
              {tables.map((table) => {
                const isAvailable =
                  table.status?.toLowerCase() === "available";
                return (
                  <div key={table.id} className="col">
                    <div
                      className={`table-card-visual ${
                        table.status?.toLowerCase() || "available"
                      } ${selectedTable === table.id ? "selected" : ""}`}
                      onClick={() =>
                        isAvailable && setSelectedTable(table.id)
                      }
                      style={{
                        cursor: isAvailable ? "pointer" : "not-allowed",
                      }}
                    >
                      <div className="table-icon">
                        <div className="table-center">
                          {table.label || `Table ${table.table_number}`}
                          <div className="capacity">
                            Capacity {table.seating_capacity}
                          </div>
                        </div>
                      </div>

                      <div className="table-info mt-3 text-center">
                        <div className="table-label">
                          {table.label || `Table ${table.table_number}`}
                        </div>
                        <div className="table-capacity">
                          Capacity: {table.seating_capacity}
                        </div>
                        <span
                          className={`status-badge ${
                            table.status?.toLowerCase() || "available"
                          }`}
                        >
                          {table.status || "Available"}
                        </span>
                      </div>
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
            className="btn-custom w-100 mt-3"
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
