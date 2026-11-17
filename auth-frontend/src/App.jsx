
import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";

import { FaWhatsapp } from "react-icons/fa";
import "./App.css";

import { signupUser, loginUser } from "./services/authService";
import ChatWindow from "./components/ChatWindow";

// ================= SIGNUP COMPONENT =================

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await signupUser(form);

      localStorage.setItem("token", response.token);

      alert(response.message);

      navigate("/chat");
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="logo">
          <FaWhatsapp />
        </div>

        <h1>Create Account</h1>

        <p className="subtitle">
          Join us today and get started!
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>

            <input
              type="tel"
              name="phone"
              placeholder="10-digit phone number"
              value={form.phone}
              onChange={handleChange}
              maxLength="10"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Create a password (minimum 8 characters)"
              value={form.password}
              onChange={handleChange}
              minLength="8"
              required
            />
          </div>

          {error && (
            <p className="error">{error}</p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="footer-text">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}

// ================= LOGIN COMPONENT =================

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    emailOrPhone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await loginUser(form);

      localStorage.setItem("token", response.token);

      alert(response.message);

      console.log("Logged in user:", response.user);

      // Navigate to Chat Window
      navigate("/chat");

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="logo">
          <FaWhatsapp />
        </div>

        <h1>Welcome Back</h1>

        <p className="subtitle">
          Login to continue to your account
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email or Phone Number</label>

            <input
              type="text"
              name="emailOrPhone"
              placeholder="Enter email or phone number"
              value={form.emailOrPhone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p className="error">{error}</p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="footer-text">
          Don't have an account?{" "}
          <Link to="/signup">Sign Up</Link>
        </p>

      </div>
    </div>
  );
}

// ================= PROTECTED CHAT ROUTE =================

function ProtectedChat() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <ChatWindow />;
}

// ================= MAIN APP =================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Signup />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/login" element={<Login />} />

        <Route path="/chat" element={<ProtectedChat />} />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
