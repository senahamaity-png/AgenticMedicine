import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Package,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Pill,
  CheckCircle2,
  Truck,
} from "lucide-react";

import api from "../services/api";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // =========================================
  // FETCH CART
  // =========================================

  const fetchCart = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "CART API RESPONSE:",
        response.data
      );

      const cartData =
        response.data?.cart ||
        response.data;

      setCart(cartData);
    } catch (err) {
      console.error(
        "Fetch cart error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load cart"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // =========================================
  // INCREASE QUANTITY
  // =========================================

  const increaseQuantity = async (
    medicineId,
    currentQuantity,
    stock
  ) => {
    if (currentQuantity >= stock) {
      alert(
        "Maximum available stock reached."
      );
      return;
    }

    try {
      await api.put(
        "/cart/quantity",
        {
          medicineId,
          quantity: currentQuantity + 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchCart();
    } catch (err) {
      console.error(
        "Increase quantity error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to update quantity"
      );
    }
  };

  // =========================================
  // DECREASE QUANTITY
  // =========================================

  const decreaseQuantity = async (
    medicineId,
    currentQuantity
  ) => {
    if (currentQuantity <= 1) {
      return;
    }

    try {
      await api.put(
        "/cart/quantity",
        {
          medicineId,
          quantity: currentQuantity - 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchCart();
    } catch (err) {
      console.error(
        "Decrease quantity error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to update quantity"
      );
    }
  };

  // =========================================
  // REMOVE ITEM
  // =========================================

  const removeItem = async (
    medicineId
  ) => {
    try {
      await api.delete(
        `/cart/${medicineId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchCart();
    } catch (err) {
      console.error(
        "Remove cart item error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to remove item"
      );
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="cart-page">

        <div className="cart-loading">

          <div className="cart-loading-icon">
            <ShoppingCart size={28} />
          </div>

          <h3>
            Loading your cart...
          </h3>

          <p>
            Preparing your selected medicines.
          </p>

        </div>

      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div className="cart-page">

        <div className="cart-error-card">

          <div className="cart-error-icon">
            !
          </div>

          <h2>
            Unable to load your cart
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={fetchCart}
            className="cart-retry-button"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // =========================================
  // EMPTY CART
  // =========================================

  if (
    !cart ||
    !cart.items ||
    cart.items.length === 0
  ) {
    return (
      <div className="cart-page">

        {/* Empty Header */}

        <div className="cart-header">

          <button
            className="cart-back-button"
            onClick={() =>
              navigate("/medicines")
            }
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </button>

          <div className="cart-title-area">

            <span className="page-eyebrow">
              SHOPPING CART
            </span>

            <h1>
              My Cart
            </h1>

            <p>
              Review your selected medicines
              before checkout.
            </p>

          </div>

        </div>


        {/* Empty Cart */}

        <div className="empty-cart">

          <div className="empty-cart-decoration">
            <span>💊</span>
            <span>+</span>
            <span>🩺</span>
          </div>

          <div className="empty-cart-icon">
            <ShoppingCart size={44} />
          </div>

          <h2>
            Your cart is empty
          </h2>

          <p>
            You haven't added any medicines
            to your cart yet.
          </p>

          <button
            className="checkout-button"
            onClick={() =>
              navigate("/medicines")
            }
          >
            Browse Medicines
            <ArrowRight size={18} />
          </button>

        </div>

      </div>
    );
  }

  // =========================================
  // CART CALCULATIONS
  // =========================================

  const totalItems =
    cart.items.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  const subtotal =
    cart.totalPrice || 0;

  // =========================================
  // MAIN CART
  // =========================================

  return (
    <div className="cart-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="cart-header">

        <button
          className="cart-back-button"
          onClick={() =>
            navigate("/medicines")
          }
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </button>

        <div className="cart-title-area">

          <div className="cart-title-row">

            <div>

              <span className="page-eyebrow">
                SHOPPING CART
              </span>

              <h1>
                My Cart
              </h1>

            </div>

            <div className="cart-item-count">

              <ShoppingCart size={17} />

              <span>
                {totalItems}{" "}
                {totalItems === 1
                  ? "item"
                  : "items"}
              </span>

            </div>

          </div>

          <p>
            Review your selected medicines
            before checkout.
          </p>

        </div>

      </div>


      {/* =====================================
          CART LAYOUT
      ====================================== */}

      <div className="cart-layout">

        {/* ===================================
            CART ITEMS
        ==================================== */}

        <div className="cart-items">

          <div className="cart-items-header">

            <div>

              <span>
                YOUR MEDICINES
              </span>

              <h2>
                Selected items
              </h2>

            </div>

            <div className="cart-items-secure">

              <ShieldCheck size={16} />

              Secure cart

            </div>

          </div>


          {cart.items.map((item) => {

            const medicine =
              item.medicine;

            if (!medicine) {
              return null;
            }

            const itemTotal =
              medicine.price *
              item.quantity;

            const isMaxStock =
              item.quantity >=
              medicine.stock;

            return (
              <div
                className="cart-item"
                key={medicine._id}
              >

                {/* MEDICINE VISUAL */}

                <div className="cart-item-image">

                  {medicine.image ? (

                    <img
                      src={medicine.image}
                      alt={medicine.name}
                    />

                  ) : (

                    <div className="cart-medicine-visual">

                      <div>
                        <Pill size={32} />
                      </div>

                      <span>
                        +
                      </span>

                    </div>

                  )}

                </div>


                {/* DETAILS */}

                <div className="cart-item-details">

                  <span className="medicine-category">
                    {medicine.category}
                  </span>

                  <h3>
                    {medicine.name}
                  </h3>

                  <p>
                    {medicine.manufacturer
                      ? `Manufactured by ${medicine.manufacturer}`
                      : "Quality medicine"}
                  </p>

                  <div className="cart-unit-price">
                    ₹{medicine.price}
                    <span>
                      / unit
                    </span>
                  </div>

                </div>


                {/* QUANTITY */}

                <div className="cart-quantity-area">

                  <span>
                    Quantity
                  </span>

                  <div className="cart-quantity">

                    <button
                      onClick={() =>
                        decreaseQuantity(
                          medicine._id,
                          item.quantity
                        )
                      }
                      disabled={
                        item.quantity <= 1
                      }
                      title="Decrease quantity"
                    >
                      <Minus size={15} />
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        increaseQuantity(
                          medicine._id,
                          item.quantity,
                          medicine.stock
                        )
                      }
                      disabled={isMaxStock}
                      title="Increase quantity"
                    >
                      <Plus size={15} />
                    </button>

                  </div>

                  {isMaxStock && (

                    <small>
                      Max stock
                    </small>

                  )}

                </div>


                {/* ITEM TOTAL */}

                <div className="cart-item-total-area">

                  <span>
                    Total
                  </span>

                  <strong className="cart-item-total">
                    ₹{itemTotal}
                  </strong>

                </div>


                {/* REMOVE */}

                <button
                  className="remove-cart-button"
                  onClick={() =>
                    removeItem(
                      medicine._id
                    )
                  }
                  title="Remove from cart"
                >
                  <Trash2 size={17} />
                </button>

              </div>
            );
          })}

        </div>


        {/* ===================================
            ORDER SUMMARY
        ==================================== */}

        <aside className="cart-summary">

          <div className="summary-heading">

            <div className="summary-icon">
              <ShoppingCart size={20} />
            </div>

            <div>

              <span>
                CHECKOUT
              </span>

              <h2>
                Order Summary
              </h2>

            </div>

          </div>


          {/* SUMMARY ROWS */}

          <div className="cart-summary-content">

            <div className="cart-summary-row">

              <span>
                Items
              </span>

              <strong>
                {totalItems}
              </strong>

            </div>


            <div className="cart-summary-row">

              <span>
                Subtotal
              </span>

              <strong>
                ₹{subtotal}
              </strong>

            </div>


            <div className="cart-summary-row">

              <span>
                Delivery
              </span>

              <strong className="free-text">
                Free
              </strong>

            </div>

          </div>


          {/* TOTAL */}

          <div className="cart-total-row">

            <div>

              <span>
                Total Amount
              </span>

              <small>
                Inclusive of selected items
              </small>

            </div>

            <strong>
              ₹{subtotal}
            </strong>

          </div>


          {/* CHECKOUT */}

          <button
            className="checkout-button"
            onClick={() =>
              navigate("/checkout")
            }
          >
            Proceed to Checkout
            <ArrowRight size={18} />
          </button>


          {/* TRUST FEATURES */}

          <div className="cart-trust-list">

            <div className="cart-trust-item">

              <div className="trust-icon">
                <ShieldCheck size={17} />
              </div>

              <div>

                <strong>
                  Secure Ordering
                </strong>

                <p>
                  Your order information
                  is protected.
                </p>

              </div>

            </div>


            <div className="cart-trust-item">

              <div className="trust-icon">
                <Truck size={17} />
              </div>

              <div>

                <strong>
                  Easy Delivery
                </strong>

                <p>
                  Simple and convenient
                  order processing.
                </p>

              </div>

            </div>


            <div className="cart-trust-item">

              <div className="trust-icon">
                <CheckCircle2 size={17} />
              </div>

              <div>

                <strong>
                  Reliable Checkout
                </strong>

                <p>
                  Review your order before
                  placing it.
                </p>

              </div>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}

export default Cart;