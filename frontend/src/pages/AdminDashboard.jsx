
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  RefreshCw,
  ShieldCheck,
  MapPin,
  CalendarDays,
} from "lucide-react";

import api from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const fetchOrders = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (user?.role !== "admin") {
      setError("Admin access required.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "ADMIN ORDERS RESPONSE:",
        response.data
      );

      const orderData =
        response.data?.orders ||
        response.data?.data ||
        response.data;

      setOrders(
        Array.isArray(orderData)
          ? orderData
          : []
      );
    } catch (err) {
      console.error(
        "Admin orders error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load admin orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (
    orderId,
    status
  ) => {
    try {
      setUpdatingId(orderId);

      await api.put(
        `/admin/orders/${orderId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        `Order status updated to ${status}`
      );

      await fetchOrders();
    } catch (err) {
      console.error(
        "Status update error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (status) => {
    if (!status) return "admin-status-pending";

    return `admin-status-${status
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-loading-icon">
            <ShieldCheck size={30} />
          </div>

          <h3>
            Loading admin dashboard...
          </h3>

          <p>
            Fetching all customer orders.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">

          <ShieldCheck size={35} />

          <h2>
            Access Error
          </h2>

          <p>{error}</p>

          <button
            onClick={() =>
              navigate("/medicines")
            }
          >
            Back to Store
          </button>

        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "Pending"
  ).length;

  const processingOrders = orders.filter(
    (order) =>
      order.status === "Processing"
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.status === "Delivered"
  ).length;

  return (
    <div className="admin-page">

      {/* =================================
          HEADER
      ================================== */}

      <div className="admin-header">

        <div>

          <span className="page-eyebrow">
            ADMIN PANEL
          </span>

          <h1>
            Order Management
          </h1>

          <p>
            Manage customer orders and
            update delivery status.
          </p>

        </div>

        <button
          className="admin-refresh-button"
          onClick={fetchOrders}
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </div>


      {/* =================================
          STATISTICS
      ================================== */}

      <div className="admin-stats">

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            <ShoppingBag size={21} />
          </div>

          <div>
            <span>
              Total Orders
            </span>

            <strong>
              {orders.length}
            </strong>
          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon pending-icon">
            <Package size={21} />
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {pendingOrders}
            </strong>
          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon processing-icon">
            <RefreshCw size={21} />
          </div>

          <div>
            <span>
              Processing
            </span>

            <strong>
              {processingOrders}
            </strong>
          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon delivered-icon">
            <ShieldCheck size={21} />
          </div>

          <div>
            <span>
              Delivered
            </span>

            <strong>
              {deliveredOrders}
            </strong>
          </div>

        </div>

      </div>


      {/* =================================
          EMPTY
      ================================== */}

      {orders.length === 0 ? (

        <div className="admin-empty">

          <div className="admin-empty-icon">
            <Package size={40} />
          </div>

          <h2>
            No orders found
          </h2>

          <p>
            Customer orders will appear
            here after they place an order.
          </p>

        </div>

      ) : (

        /* =================================
           ORDERS
        ================================== */

        <div className="admin-orders">

          {orders.map((order) => (

            <div
              className="admin-order-card"
              key={order._id}
            >

              {/* Order Header */}

              <div className="admin-order-header">

                <div className="admin-order-title">

                  <div className="admin-order-icon">
                    <Package size={20} />
                  </div>

                  <div>

                    <span>
                      ORDER ID
                    </span>

                    <h3>
                      #
                      {order._id
                        ? order._id
                            .slice(-8)
                            .toUpperCase()
                        : "N/A"}
                    </h3>

                  </div>

                </div>


                <div
                  className={`admin-order-status ${getStatusClass(
                    order.status
                  )}`}
                >
                  {order.status ||
                    "Pending"}
                </div>

              </div>


              {/* Customer Info */}

              <div className="admin-customer-info">

                <div>

                  <span>
                    CUSTOMER
                  </span>

                  <strong>
                    {order.user?.name ||
                      "Customer"}
                  </strong>

                </div>


                <div>

                  <span>
                    EMAIL
                  </span>

                  <strong>
                    {order.user?.email ||
                      "N/A"}
                  </strong>

                </div>


                <div>

                  <span>
                    ORDER DATE
                  </span>

                  <strong>
                    <CalendarDays
                      size={13}
                    />

                    {formatDate(
                      order.createdAt
                    )}
                  </strong>

                </div>

              </div>


              {/* Address */}

              <div className="admin-address">

                <MapPin size={17} />

                <div>

                  <span>
                    DELIVERY ADDRESS
                  </span>

                  <strong>
                    {order.address ||
                      "Address unavailable"}
                  </strong>

                </div>

              </div>


              {/* Products */}

              <div className="admin-order-items">

                {order.items?.map(
                  (item, index) => (

                    <div
                      className="admin-order-item"
                      key={
                        item._id ||
                        index
                      }
                    >

                      <div className="admin-item-icon">
                        <Package size={17} />
                      </div>

                      <div className="admin-item-info">

                        <strong>
                          {item.name ||
                            "Medicine"}
                        </strong>

                        <span>
                          Qty:{" "}
                          {item.quantity ||
                            0}
                        </span>

                      </div>

                      <strong>
                        ₹
                        {(item.price ||
                          0) *
                          (item.quantity ||
                            0)}
                      </strong>

                    </div>

                  )
                )}

              </div>


              {/* Footer */}

              <div className="admin-order-footer">

                <div className="admin-total">

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹
                    {order.totalAmount ||
                      0}
                  </strong>

                </div>


                <div className="admin-status-control">

                  <label>
                    Update Status
                  </label>

                  <select
                    value={
                      order.status ||
                      "Pending"
                    }
                    disabled={
                      updatingId ===
                      order._id
                    }
                    onChange={(e) =>
                      updateStatus(
                        order._id,
                        e.target.value
                      )
                    }
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Confirmed">
                      Confirmed
                    </option>

                    <option value="Processing">
                      Processing
                    </option>

                    <option value="Shipped">
                      Shipped
                    </option>

                    <option value="Delivered">
                      Delivered
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>

                  </select>

                  {updatingId ===
                    order._id && (
                    <span className="updating-text">
                      Updating...
                    </span>
                  )}

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default AdminDashboard;
