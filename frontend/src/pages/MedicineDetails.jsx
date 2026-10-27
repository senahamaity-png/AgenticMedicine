import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pill,
  ShoppingCart,
  Package,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";

function MedicineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchMedicine();
  }, [id]);

  const fetchMedicine = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/medicines/${id}`);

      console.log("MEDICINE DETAILS RESPONSE:", response.data);
setMedicine(response.data.medicine || response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load medicine details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (type) => {
    if (!medicine) return;

    if (type === "increase") {
      setQuantity((prev) =>
        prev < medicine.stock ? prev + 1 : prev
      );
    }

    if (type === "decrease") {
      setQuantity((prev) =>
        prev > 1 ? prev - 1 : prev
      );
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first to add medicine to cart.");
      navigate("/login");
      return;
    }

    try {
      await api.post(
        "/cart",
        {
          medicineId: medicine._id,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`${medicine.name} added to cart successfully!`);

      navigate("/cart");
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Failed to add medicine to cart."
      );
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          Loading medicine details...
        </div>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-icon">
            <AlertCircle size={30} />
          </div>

          <h3>Medicine Not Found</h3>

          <p>
            {error || "The requested medicine could not be found."}
          </p>

          <br />

          <button
            className="primary-button"
            onClick={() => navigate("/medicines")}
          >
            Back to Medicines
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = medicine.stock <= 0;

  return (
    <div className="medicine-details-page">
      <div className="container">

        {/* Back Button */}
        <button
          className="details-back-button"
          onClick={() => navigate("/medicines")}
        >
          <ArrowLeft size={17} />
          Back to Medicines
        </button>

        {/* Main Details */}
        <div className="medicine-details-card">

          {/* Left Image */}
          <div className="details-image-section">

            <div className="details-image">

              {medicine.image ? (
                <img
  src={
    medicine.image?.startsWith("http")
      ? medicine.image
      : `${window.location.origin}${medicine.image}`
  }
  alt={medicine.name}
  onError={(e) => {
    console.error("Medicine image failed:", e.currentTarget.src);
  }}
/>
              ) : (
                <div className="details-placeholder">
                  <Pill size={75} />
                </div>
              )}

              <span
                className={
                  isOutOfStock
                    ? "details-stock out"
                    : "details-stock"
                }
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : "✓ In Stock"}
              </span>
            </div>

          </div>

          {/* Right Information */}
          <div className="details-content">

            <span className="details-category">
              {medicine.category}
            </span>

            <h1>{medicine.name}</h1>

            <p className="details-description">
              {medicine.description ||
                "No description available for this medicine."}
            </p>

            {/* Price */}
            <div className="details-price">
              ₹{medicine.price}
            </div>

            {/* Manufacturer */}
            <div className="details-info-list">

              <div className="details-info-item">
                <Package size={18} />
                <div>
                  <span>Manufacturer</span>
                  <strong>
                    {medicine.manufacturer || "Not specified"}
                  </strong>
                </div>
              </div>

              <div className="details-info-item">
                <Pill size={18} />
                <div>
                  <span>Category</span>
                  <strong>
                    {medicine.category || "General"}
                  </strong>
                </div>
              </div>

              <div className="details-info-item">
                <ShieldCheck size={18} />
                <div>
                  <span>Prescription</span>
                  <strong>
                    {medicine.prescriptionRequired
                      ? "Prescription Required"
                      : "No Prescription Required"}
                  </strong>
                </div>
              </div>

            </div>

            {/* Stock */}
            <div className="details-stock-info">
              <strong>Available Stock:</strong>{" "}
              {medicine.stock}
            </div>

            {/* Quantity */}
            {!isOutOfStock && (
              <div className="quantity-section">

                <span>Quantity</span>

                <div className="quantity-control">

                  <button
                    onClick={() =>
                      handleQuantityChange("decrease")
                    }
                  >
                    −
                  </button>

                  <span>{quantity}</span>

                  <button
                    onClick={() =>
                      handleQuantityChange("increase")
                    }
                  >
                    +
                  </button>

                </div>

              </div>
            )}

            {/* Add Cart */}
            <button
              className="details-add-cart"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={19} />

              {isOutOfStock
                ? "Out of Stock"
                : "Add to Cart"}
            </button>

            <div className="details-safe-note">
              <ShieldCheck size={18} />

              <span>
                Secure ordering • Verified medicine information
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default MedicineDetails;