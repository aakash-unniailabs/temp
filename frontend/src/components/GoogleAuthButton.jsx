import React, { useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function GoogleAuthButton({ setSuccess, setError }) {
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(AuthContext);

  const handleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;

      // Send token to backend for verification
      const response = await axios.post("http://localhost:5000/api/google/login", {
        token,
      });

      const { token: authToken, customer } = response.data;

      // Set auth data (this will also save to localStorage)
      setToken(authToken);

      // Set user data if available
      if (customer) {
        setUser(customer);
      }

      setSuccess("Google login successful!");

      // Redirect to homepage
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("Google login failed.");
    }
  };

  const handleError = () => {
    setError("Google login was cancelled or failed.");
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}

export default GoogleAuthButton;
