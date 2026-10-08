import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Package,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Truck,
  LockKeyhole,
  ShoppingBag,
  X,
  CircleCheck,
} from "lucide-react";

import api from "../services/api";

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const token = localStorage.getItem("token");

  // =========================================
  // FETCH CART
  // =========================================

  useEffect(() => {
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
          "CHECKOUT CART RESPONSE:",
          response.data
        );

        const cartData =
          response.data?.cart || response.data;

        setCart(cartData);
      } catch (err) {
        console.error(
          "Checkout cart error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load your cart."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token, navigate]);

  // =========================================
  // VALIDATE ADDRESS
  // =========================================

  const validateAddress = () => {
    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setError(
        "Please enter your delivery address."
      );
      return false;
    }

    if (trimmedAddress.length < 15) {
      setError(
        "Please enter a complete delivery address."
      );
      return false;
    }

    // Indian PIN code validation
    const pinCodePattern = /\b[1-9][0-9]{5}\b/;

    if (!pinCodePattern.test(trimmedAddress)) {
      setError(
        "Please include a valid 6-digit PIN code in your address."
      );
      return false;
    }

    if (!cart?.items?.length) {
      setError("Your cart is empty.");
      return false;
    }

    return true;
  };

  // =========================================
  // OPEN CONFIRMATION
  // =========================================

  const handlePlaceOrder = (e) => {
    if (e) {
      e.preventDefault();
    }

    setError("");

    const isValid = validateAddress();

    if (!isValid) {
      return;
    }

    setShowConfirm(true);
  };

  // =========================================
  // CONFIRM ORDER
  // =========================================

  const confirmOrder = async () => {
    try {
      setPlacingOrder(true);
      setError("");

      console.log(
        "Creating order with address:",
        address
      );

      const response = await api.post(
        "/orders",
        {
          address: address.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "ORDER CREATED:",
        response.data
      );

      setShowConfirm(false);
      setOrderSuccess(true);
    } catch (err) {
      console.error(
        "Place order error:",
        err
      );

      setShowConfirm(false);

      setError(
        err.response?.data?.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-loading">
          <div className="checkout-loading-icon">
            <Package size={30} />
          </div>

          <h3>
            Preparing checkout...
          </h3>

          <p>
            Loading your cart details.
          </p>
        </div>
      </div>
    );
  }

  // =========================================
  // SUCCESS SCREEN
  // =========================================

  if (orderSuccess) {
    return (
      <div className="checkout-page">
        <div className="order-success-card">

          <div className="success-animation">
            <CircleCheck size={58} />
          </div>

          <span className="page-eyebrow">
            ORDER CONFIRMED
          </span>

          <h1>
            Your order is on the way! 🎉
          </h1>

          <p>
            Your medicine order has been placed
            successfully. You can track its status
            from your Orders page.
          </p>

          <div className="success-details">

            <div>
              <ShieldCheck size={18} />
              <span>
                Securely placed
              </span>
            </div>

            <div>
              <Truck size={18} />
              <span>
                Delivery tracking available
              </span>
            </div>

          </div>

          <div className="success-actions">

            <button
              className="success-primary-button"
              onClick={() =>
                navigate("/orders")
              }
            >
              <Package size={18} />
              View My Orders
            </button>

            <button
              className="success-secondary-button"
              onClick={() =>
                navigate("/medicines")
              }
            >
              Continue Shopping
            </button>

          </div>

        </div>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error && !cart) {
    return (
      <div className="checkout-page">
        <div className="checkout-error">

          <div className="checkout-error-icon">
            !
          </div>

          <strong>
            Something went wrong
          </strong>

          <p>{error}</p>

          <button
            onClick={() =>
              navigate("/cart")
            }
          >
            <ArrowLeft size={16} />
            Back to Cart
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
      <div className="checkout-page">

        <div className="checkout-empty">

          <div className="checkout-empty-decoration">
            <ShoppingBag size={22} />
          </div>

          <div className="checkout-empty-icon">
            <Package size={38} />
          </div>

          <span className="page-eyebrow">
            CHECKOUT
          </span>

          <h2>
            Your cart is empty
          </h2>

          <p>
            Add some medicines before
            proceeding to checkout.
          </p>

          <button
            onClick={() =>
              navigate("/medicines")
            }
          >
            Browse Medicines
          </button>

        </div>

      </div>
    );
  }

  // =========================================
  // TOTAL ITEMS
  // =========================================

  const totalItems = cart.items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  // =========================================
  // MAIN UI
  // =========================================

  return (
    <div className="checkout-page">

      {/* HEADER */}

      <div className="checkout-header">

        <button
          className="back-to-cart"
          onClick={() =>
            navigate("/cart")
          }
        >
          <ArrowLeft size={17} />
          Back to Cart
        </button>

        <div className="checkout-heading">

          <span className="page-eyebrow">
            SECURE CHECKOUT
          </span>

          <div className="checkout-title-row">

            <div>
              <h1>
                Complete your order
              </h1>

              <p>
                Enter your delivery details
                and confirm your medicine order.
              </p>
            </div>

            <div className="checkout-lock">
              <LockKeyhole size={20} />
              <span>Secure</span>
            </div>

          </div>

        </div>

      </div>


      {/* =====================================
          CHECKOUT PROGRESS
      ====================================== */}

      <div className="checkout-progress">

        <div className="progress-step completed">
          <div className="progress-circle">
            <CheckCircle2 size={17} />
          </div>

          <span>
            Cart
          </span>
        </div>

        <div className="progress-line active"></div>

        <div className="progress-step current">
          <div className="progress-circle">
            2
          </div>

          <span>
            Checkout
          </span>
        </div>

        <div className="progress-line"></div>

        <div className="progress-step">
          <div className="progress-circle">
            3
          </div>

          <span>
            Order
          </span>
        </div>

      </div>


      {/* CHECKOUT LAYOUT */}

      <div className="checkout-layout">

        {/* LEFT */}

        <div className="checkout-main">

          {/* DELIVERY ADDRESS */}

          <section className="checkout-card">

            <div className="checkout-card-header">

              <div className="checkout-card-icon">
                <MapPin size={20} />
              </div>

              <div>
                <h2>
                  Delivery Address
                </h2>

                <p>
                  Where should we deliver
                  your medicines?
                </p>
              </div>

            </div>

            <form
              onSubmit={handlePlaceOrder}
              className="address-form"
            >

              <label>
                Full Delivery Address
              </label>

              <textarea
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setError("");
                }}
                placeholder="Enter your complete address, city, state and PIN code"
                rows="5"
              />

              <div className="address-hint">
                <MapPin size={15} />

                <span>
                  Example: Durgapur,
                  West Bengal - 713200
                </span>
              </div>

            </form>

          </section>


          {/* ORDER ITEMS */}

          <section className="checkout-card">

            <div className="checkout-card-header">

              <div className="checkout-card-icon">
                <Package size={20} />
              </div>

              <div>
                <h2>
                  Order Items
                </h2>

                <p>
                  {totalItems} item
                  {totalItems !== 1
                    ? "s"
                    : ""} in your order
                </p>
              </div>

            </div>

            <div className="checkout-items">

              {cart.items.map(
                (item) => {

                  const medicine =
                    item.medicine;

                  if (!medicine) {
                    return null;
                  }

                  return (
                    <div
                      className="checkout-item"
                      key={medicine._id}
                    >

                      <div className="checkout-item-image">

                        {medicine.image ? (
                          <img
                            src={
                              medicine.image
                            }
                            alt={
                              medicine.name
                            }
                          />
                        ) : (
                          <div className="checkout-medicine-icon">
                            <Package
                              size={28}
                            />
                          </div>
                        )}

                      </div>

                      <div className="checkout-item-info">

                        <span className="checkout-item-category">
                          {medicine.category}
                        </span>

                        <h3>
                          {medicine.name}
                        </h3>

                        <p>
                          Qty:{" "}
                          {item.quantity}
                        </p>

                      </div>

                      <div className="checkout-item-price">

                        <span>
                          ₹{medicine.price} each
                        </span>

                        <strong>
                          ₹
                          {medicine.price *
                            item.quantity}
                        </strong>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>


          {/* ERROR */}

          {error && (
            <div className="checkout-form-error">

              <span className="checkout-error-dot">
                !
              </span>

              <span>
                {error}
              </span>

            </div>
          )}

        </div>


        {/* RIGHT */}

        <aside className="checkout-summary">

          <div className="summary-top">

            <div className="summary-icon">
              <ShoppingBag size={20} />
            </div>

            <div>
              <span>
                YOUR ORDER
              </span>

              <h2>
                Order Summary
              </h2>
            </div>

          </div>


          <div className="summary-row">
            <span>
              Items
            </span>

            <span>
              {totalItems}
            </span>
          </div>


          <div className="summary-row">
            <span>
              Subtotal
            </span>

            <span>
              ₹{cart.totalPrice || 0}
            </span>
          </div>


          <div className="summary-row">
            <span>
              Delivery
            </span>

            <span className="free-text">
              Free
            </span>
          </div>


          <div className="summary-divider"></div>


          <div className="checkout-total">
            <span>
              Total Amount
            </span>

            <strong>
              ₹{cart.totalPrice || 0}
            </strong>
          </div>


          <button
            className="place-order-button"
            onClick={handlePlaceOrder}
            disabled={placingOrder}
          >
            <CheckCircle2 size={19} />
            Review & Place Order
          </button>


          <div className="checkout-security">

            <div className="checkout-feature-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>
                Safe & Secure
              </strong>

              <p>
                Your order details are
                securely processed.
              </p>
            </div>

          </div>


          <div className="delivery-info">

            <div className="checkout-feature-icon">
              <Truck size={19} />
            </div>

            <div>
              <strong>
                Order Tracking
              </strong>

              <p>
                Track your order status
                from the Orders page.
              </p>
            </div>

          </div>


          <div className="checkout-trust-line">
            <LockKeyhole size={14} />
            Secure checkout · Free delivery
          </div>

        </aside>

      </div>


      {/* =====================================
          CONFIRMATION MODAL
      ====================================== */}

      {showConfirm && (
        <div className="checkout-modal-overlay">

          <div className="checkout-confirm-modal">

            <button
              className="modal-close-button"
              onClick={() =>
                setShowConfirm(false)
              }
              disabled={placingOrder}
            >
              <X size={18} />
            </button>

            <div className="confirm-icon">
              <ShoppingBag size={27} />
            </div>

            <span className="page-eyebrow">
              CONFIRM ORDER
            </span>

            <h2>
              Ready to place your order?
            </h2>

            <p>
              Please check your order details
              before confirming.
            </p>


            <div className="confirm-summary">

              <div>
                <span>
                  Items
                </span>

                <strong>
                  {totalItems}
                </strong>
              </div>

              <div>
                <span>
                  Total
                </span>

                <strong>
                  ₹{cart.totalPrice || 0}
                </strong>
              </div>

            </div>


            <div className="confirm-address">

              <MapPin size={17} />

              <div>
                <span>
                  Delivery Address
                </span>

                <p>
                  {address.trim()}
                </p>
              </div>

            </div>


            <div className="confirm-actions">

              <button
                className="cancel-order-button"
                onClick={() =>
                  setShowConfirm(false)
                }
                disabled={placingOrder}
              >
                Go Back
              </button>

              <button
                className="confirm-order-button"
                onClick={confirmOrder}
                disabled={placingOrder}
              >

                {placingOrder ? (
                  <>
                    <span className="button-spinner"></span>
                    Placing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Confirm Order
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Checkout;