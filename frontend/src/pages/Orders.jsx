import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ArrowLeft,
  MapPin,
  CalendarDays,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";

import api from "../services/api";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("ORDERS API RESPONSE:", response.data);

      const orderData =
        response.data?.orders ||
        response.data?.data ||
        response.data;

      setOrders(
        Array.isArray(orderData) ? orderData : []
      );
    } catch (err) {
      console.error("Fetch orders error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    if (!status) return "status-default";

    return `status-${status
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <div className="orders-loading-icon">
            <Package size={30} />
          </div>

          <h3>Loading your orders...</h3>

          <p>
            Please wait while we fetch your order history.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-error">
          <Package size={32} />

          <h2>
            Unable to load orders
          </h2>

          <p>{error}</p>

          <button onClick={fetchOrders}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="orders-header">

        <div>
          <button
            className="orders-back-button"
            onClick={() => navigate("/medicines")}
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </button>

          <span className="page-eyebrow">
            ORDER HISTORY
          </span>

          <h1>
            My Orders
          </h1>

          <p>
            Track your medicine orders and
            view their current status.
          </p>
        </div>

        <div className="orders-count-card">

          <div className="orders-count-icon">
            <ShoppingBag size={21} />
          </div>

          <div>
            <strong>
              {orders.length}
            </strong>

            <span>
              Total Orders
            </span>
          </div>

        </div>

      </div>


      {/* =====================================
          EMPTY ORDERS
      ====================================== */}

      {orders.length === 0 ? (
        <div className="orders-empty">

          <div className="orders-empty-icon">
            <Package size={42} />
          </div>

          <h2>
            No orders yet
          </h2>

          <p>
            You haven't placed any medicine
            orders yet.
          </p>

          <button
            onClick={() =>
              navigate("/medicines")
            }
          >
            Browse Medicines
            <ChevronRight size={17} />
          </button>

        </div>
      ) : (

        /* ===================================
           ORDERS LIST
        ==================================== */

        <div className="orders-list">

          {orders.map((order, index) => (

            <div
              className="order-card"
              key={order._id || index}
            >

              {/* Order Header */}

              <div className="order-card-header">

                <div className="order-id-section">

                  <div className="order-icon">
                    <Package size={20} />
                  </div>

                  <div>

                    <span>
                      ORDER ID
                    </span>

                    <h3>
                      #{order._id
                        ? order._id.slice(-8).toUpperCase()
                        : "N/A"}
                    </h3>

                  </div>

                </div>


                <div
                  className={`order-status ${getStatusClass(
                    order.status
                  )}`}
                >
                  {order.status || "Pending"}
                </div>

              </div>


              {/* Order Info */}

              <div className="order-info-row">

                <div className="order-info-item">

                  <CalendarDays size={17} />

                  <div>
                    <span>
                      Order Date
                    </span>

                    <strong>
                      {formatDate(
                        order.createdAt ||
                          order.updatedAt
                      )}
                    </strong>
                  </div>

                </div>


                <div className="order-info-item">

                  <ShoppingBag size={17} />

                  <div>
                    <span>
                      Items
                    </span>

                    <strong>
                      {order.items?.reduce(
                        (total, item) =>
                          total +
                          (item.quantity || 0),
                        0
                      ) || 0}
                    </strong>
                  </div>

                </div>


                <div className="order-info-item">

                  <MapPin size={17} />

                  <div>
                    <span>
                      Delivery
                    </span>

                    <strong>
                      {order.address ||
                        "Address unavailable"}
                    </strong>
                  </div>

                </div>

              </div>


              {/* Items */}

              <div className="order-products">

                {order.items?.map(
                  (item, itemIndex) => (

                    <div
                      className="order-product"
                      key={
                        item._id ||
                        itemIndex
                      }
                    >

                      <div className="order-product-icon">
                        <Package size={18} />
                      </div>

                      <div className="order-product-info">

                        <strong>
                          {item.name ||
                            "Medicine"}
                        </strong>

                        <span>
                          Quantity:{" "}
                          {item.quantity || 0}
                        </span>

                      </div>

                      <strong className="order-product-price">
                        ₹
                        {(item.price || 0) *
                          (item.quantity || 0)}
                      </strong>

                    </div>

                  )
                )}

              </div>


              {/* Footer */}

              <div className="order-card-footer">

                <div>
                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹{order.totalAmount || 0}
                  </strong>
                </div>

                <div className="order-status-note">

                  {order.status ===
                  "Delivered"
                    ? "Order delivered successfully"
                    : order.status ===
                      "Cancelled"
                    ? "This order was cancelled"
                    : "Your order is being processed"}

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Orders;