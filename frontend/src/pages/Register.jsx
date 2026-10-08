import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Pill,
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/register",
        formData
      );

      setSuccess(
        response.data?.message ||
          "Registration successful!"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* Left Side */}
        <div className="auth-brand">

          <div className="auth-brand-icon">
            <Pill size={34} />
          </div>

          <h1>
            Join Agentic Medicine
          </h1>

          <p>
            Create your account and get a simple,
            secure and convenient online medicine
            ordering experience.
          </p>

          <div className="auth-feature">
            <ShieldCheck size={18} />
            <span>
              Secure Account
            </span>
          </div>

          <div className="auth-feature">
            <Pill size={18} />
            <span>
              Smart Medicine Assistant
            </span>
          </div>

        </div>

        {/* Register Card */}
        <div className="auth-card">

          <div className="auth-header">

            <h2>
              Create Account
            </h2>

            <p>
              Fill in your details to get started
            </p>

          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="auth-form-group">

              <label>
                Full Name
              </label>

              <div className="auth-input-wrapper">

                <User size={18} />

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* Email */}
            <div className="auth-form-group">

              <label>
                Email Address
              </label>

              <div className="auth-input-wrapper">

                <Mail size={18} />

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* Password */}
            <div className="auth-form-group">

              <label>
                Password
              </label>

              <div className="auth-input-wrapper">

                <Lock size={18} />

                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <div className="auth-footer">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Login
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;