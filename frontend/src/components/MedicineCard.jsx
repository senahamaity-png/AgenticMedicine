import { Link } from "react-router-dom";
import {
  Pill,
  ShoppingCart,
  ArrowUpRight,
} from "lucide-react";

function MedicineCard({ medicine, onAddToCart }) {
  const {
    _id,
    name,
    category,
    description,
    price,
    stock,
    manufacturer,
    image,
    prescriptionRequired,
  } = medicine;

  const isOutOfStock = stock <= 0;

  return (
    <article className="medicine-card">

      {/* TOP AREA */}
      <div className="medicine-image">

        {image ? (
          <img src={image} alt={name} />
        ) : (
          <div className="medicine-visual">

            <div className="medicine-circle">
              <Pill size={38} />
            </div>

            <span className="medicine-plus">
              +
            </span>

          </div>
        )}

        <span
          className={
            isOutOfStock
              ? "stock-badge out"
              : "stock-badge"
          }
        >
          <span className="stock-dot"></span>
          {isOutOfStock
            ? "Out of Stock"
            : "In Stock"}
        </span>

        {prescriptionRequired && (
          <span className="prescription-badge">
            Prescription
          </span>
        )}

      </div>


      {/* CONTENT */}
      <div className="medicine-content">

        <div className="medicine-top-line">

          <span className="medicine-category">
            {category}
          </span>

          <Link
            to={`/medicines/${_id}`}
            className="medicine-view"
            title="View details"
          >
            <ArrowUpRight size={17} />
          </Link>

        </div>


        <Link
          to={`/medicines/${_id}`}
          className="medicine-title-link"
        >
          <h3 className="medicine-name">
            {name}
          </h3>
        </Link>


        <p className="medicine-description">
          {description?.length > 72
            ? `${description.substring(0, 72)}...`
            : description ||
              "Quality medicine available for online ordering."}
        </p>


        <div className="medicine-manufacturer">
          <span>Manufacturer</span>
          <strong>{manufacturer || "Trusted Pharma"}</strong>
        </div>


        <div className="medicine-bottom">

          <div className="medicine-price-box">
            <span>Price</span>
            <strong>₹{price}</strong>
          </div>


          <button
            className="add-cart-button"
            disabled={isOutOfStock}
            onClick={() =>
              onAddToCart &&
              onAddToCart(medicine)
            }
          >
            <ShoppingCart size={16} />

            {isOutOfStock
              ? "Unavailable"
              : "Add to Cart"}
          </button>

        </div>

      </div>

    </article>
  );
}

export default MedicineCard;