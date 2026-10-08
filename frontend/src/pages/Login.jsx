import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pill, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", formData);

      const data = response.data;

      /*
        Backend response may contain:
        token
        user
      */

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      // Redirect according to role
      if (data.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/medicines");
      }

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Invalid email or password."
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
            Welcome Back
          </h1>

          <p>
            Login to your Agentic Medicine account
            and manage your medicines, cart and orders.
          </p>

          <div className="auth-feature">
            <ShieldCheck size={18} />
            <span>
              Secure JWT Authentication
            </span>
          </div>

          <div className="auth-feature">
            <Pill size={18} />
            <span>
              Easy Medicine Ordering
            </span>
          </div>

        </div>

        {/* Form */}
        <div className="auth-card">

          <div className="auth-header">

            <h2>
              Login
            </h2>

            <p>
              Enter your account details below
            </p>

          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

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
                  placeholder="Enter your password"
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
                "Logging in..."
              ) : (
                <>
                  Login
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <div className="auth-footer">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create Account
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;