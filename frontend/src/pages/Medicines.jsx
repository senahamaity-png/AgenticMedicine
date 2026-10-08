import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  PackageSearch,
  ArrowRight,
  Pill,
  Home,
  Package,
  Bot,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import MedicineCard from "../components/MedicineCard";
import AIAssistant from "../components/AIAssistant";

function Medicines() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // =========================================
  // USER / AUTH STATE
  // =========================================

  const getStoredUser = () => {
    try {
      const user = localStorage.getItem("user");

      if (!user) {
        return null;
      }

      return JSON.parse(user);
    } catch (error) {
      console.error("User data error:", error);
      return null;
    }
  };

  const [user, setUser] = useState(getStoredUser());

  const token = localStorage.getItem("token");

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setMobileMenuOpen(false);

    navigate("/login");
  };

  // =========================================
  // NAVIGATION
  // =========================================

  const goToSection = (selector) => {
    setMobileMenuOpen(false);

    setTimeout(() => {
      document
        .querySelector(selector)
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  // =========================================
  // FETCH MEDICINES
  // =========================================

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/medicines");

        console.log(
          "MEDICINES API RESPONSE:",
          response.data
        );

        const data = response.data;

        const medicineList = Array.isArray(data)
          ? data
          : data.medicines || data.data || [];

        setMedicines(medicineList);
        setFilteredMedicines(medicineList);
      } catch (err) {
        console.error("Medicine fetch error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load medicines. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  // =========================================
  // SEARCH + CATEGORY + SORT
  // =========================================

  useEffect(() => {
    let result = [...medicines];

    // Search
    if (search.trim()) {
      const searchText = search.toLowerCase().trim();

      result = result.filter((medicine) => {
        return (
          medicine.name
            ?.toLowerCase()
            .includes(searchText) ||
          medicine.category
            ?.toLowerCase()
            .includes(searchText) ||
          medicine.manufacturer
            ?.toLowerCase()
            .includes(searchText)
        );
      });
    }

    // Category
    if (category !== "All") {
      result = result.filter(
        (medicine) =>
          medicine.category === category
      );
    }

    // Sort
    if (sort === "low") {
      result.sort(
        (a, b) => a.price - b.price
      );
    }

    if (sort === "high") {
      result.sort(
        (a, b) => b.price - a.price
      );
    }

    setFilteredMedicines(result);
  }, [
    search,
    category,
    sort,
    medicines,
  ]);

  // =========================================
  // ADD TO CART
  // =========================================

  const handleAddToCart = async (medicine) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    try {
      console.log(
        "Adding to cart:",
        medicine
      );

      const response = await api.post(
        "/cart",
        {
          medicineId: medicine._id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "ADD TO CART RESPONSE:",
        response.data
      );

      alert(
        `${medicine.name} added to cart successfully!`
      );

      navigate("/cart");
    } catch (err) {
      console.error(
        "Add to cart error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to add medicine to cart."
      );
    }
  };

  // =========================================
  // CATEGORIES
  // =========================================

  const categories = [
    "All",
    ...new Set(
      medicines
        .map(
          (medicine) => medicine.category
        )
        .filter(Boolean)
    ),
  ];

  // =========================================
  // LOADING STATE
  // =========================================

  if (loading) {
    return (
      <div className="medicines-page">
        <div className="medicine-loading-page">
          <div className="loading-icon">
            <ShoppingCart size={30} />
          </div>

          <h3>Loading medicines...</h3>

          <p>
            Please wait while we prepare your
            medicine collection.
          </p>
        </div>
      </div>
    );
  }

  // =========================================
  // MAIN UI
  // =========================================

  return (
    <div className="medicines-page">

      {/* =====================================
          NAVBAR
      ====================================== */}

      <header className="pharmacy-navbar">

        <div className="navbar-inner">

          {/* BRAND */}

          <button
            className="navbar-brand"
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });

              setMobileMenuOpen(false);
            }}
          >

            <div className="navbar-logo">
              <Pill size={22} />
            </div>

            <div className="navbar-brand-text">
              <strong>
                Medi<span>Pilot AI</span>
              </strong>

              <small>
                Smart Online Pharmacy
              </small>
            </div>

          </button>


          {/* DESKTOP NAVIGATION */}

          <nav className="navbar-links">

            <button
              className="navbar-link active"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
            >
              <Home size={16} />
              Medicines
            </button>


            <button
              className="navbar-link"
              onClick={() =>
                navigate("/cart")
              }
            >
              <ShoppingCart size={16} />
              Cart
            </button>


            {token && (
              <button
                className="navbar-link"
                onClick={() =>
                  navigate("/orders")
                }
              >
                <Package size={16} />
                Orders
              </button>
            )}


            <button
              className="navbar-link ai-nav-link"
              onClick={() =>
                goToSection(".ai-section")
              }
            >
              <Bot size={16} />
              AI Assistant

              <span className="ai-nav-dot"></span>
            </button>

          </nav>


          {/* DESKTOP RIGHT */}

          <div className="navbar-right">

            {user?.role === "admin" && (

              <button
                className="navbar-admin-button"
                onClick={() =>
                  navigate("/admin")
                }
              >
                <ShieldCheck size={16} />
                Admin
              </button>

            )}


            {!token ? (
              <>
                <button
                  className="navbar-login-button"
                  onClick={() =>
                    navigate("/login")
                  }
                >
                  <LogIn size={16} />
                  Login
                </button>

                <button
                  className="navbar-register-button"
                  onClick={() =>
                    navigate("/register")
                  }
                >
                  <UserPlus size={16} />
                  Register
                </button>
              </>
            ) : (

              <div className="navbar-user-area">

                <div className="navbar-user-avatar">
                  {user?.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

                <div className="navbar-user-info">

                  <span>Hello,</span>

                  <strong>
                    {user?.name || "User"}
                  </strong>

                </div>

                <button
                  className="navbar-logout"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut size={17} />
                </button>

              </div>

            )}

          </div>


          {/* MOBILE MENU BUTTON */}

          <button
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenuOpen(
                !mobileMenuOpen
              )
            }
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>

        </div>


        {/* MOBILE MENU */}

        {mobileMenuOpen && (

          <div className="mobile-navbar-menu">

            <button
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });

                setMobileMenuOpen(false);
              }}
            >
              <Home size={17} />
              Medicines
            </button>


            <button
              onClick={() => {
                navigate("/cart");
                setMobileMenuOpen(false);
              }}
            >
              <ShoppingCart size={17} />
              Cart
            </button>


            {token && (

              <button
                onClick={() => {
                  navigate("/orders");
                  setMobileMenuOpen(false);
                }}
              >
                <Package size={17} />
                Orders
              </button>

            )}


            <button
              onClick={() =>
                goToSection(".ai-section")
              }
            >
              <Bot size={17} />
              AI Assistant
            </button>


            {user?.role === "admin" && (

              <button
                onClick={() => {
                  navigate("/admin");
                  setMobileMenuOpen(false);
                }}
              >
                <ShieldCheck size={17} />
                Admin Dashboard
              </button>

            )}


            {!token ? (
              <>

                <button
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogIn size={17} />
                  Login
                </button>

                <button
                  onClick={() => {
                    navigate("/register");
                    setMobileMenuOpen(false);
                  }}
                >
                  <UserPlus size={17} />
                  Register
                </button>

              </>
            ) : (

              <button
                onClick={handleLogout}
              >
                <LogOut size={17} />
                Logout
              </button>

            )}

          </div>

        )}

      </header>


      {/* =====================================
          HERO / PAGE HEADER
      ====================================== */}

      <section className="medicine-hero">

        <div className="medicine-hero-content">

          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            SMART ONLINE PHARMACY
          </div>

          <h1>
            Your health,
            <br />
            <span>made simpler.</span>
          </h1>

          <p>
            Search medicines, check real-time availability,
            manage your cart and order easily with our
            AI-powered medicine assistant.
          </p>

          <div className="hero-actions">

            <button
              className="hero-primary-button"
              onClick={() =>
                document
                  .querySelector(".medicine-section")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Browse Medicines
              <ArrowRight size={18} />
            </button>

            <button
              className="hero-secondary-button"
              onClick={() =>
                document
                  .querySelector(".ai-section")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              🤖 Ask AI Assistant
            </button>

          </div>

          <div className="hero-mini-info">

            <div>
              <span className="hero-check">✓</span>
              Verified medicines
            </div>

            <div>
              <span className="hero-check">✓</span>
              Secure ordering
            </div>

            <div>
              <span className="hero-check">✓</span>
              Easy checkout
            </div>

          </div>

        </div>


        {/* HERO VISUAL */}

        <div className="medicine-hero-card">

          <div className="hero-glow"></div>

          <div className="hero-card-icon">
            💊
          </div>

          <div className="hero-floating-icon hero-icon-one">
            🩺
          </div>

          <div className="hero-floating-icon hero-icon-two">
            🤖
          </div>

          <div className="hero-floating-icon hero-icon-three">
            ✓
          </div>

          <div className="hero-card-content">

            <span>AI POWERED</span>

            <strong>
              Medicine
              <br />
              Assistant
            </strong>

            <p>
              Search medicines, check stock
              and manage your cart smarter.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================
          QUICK STATS
      ====================================== */}

      <section className="medicine-stats">

        <div className="stat-card">

          <div className="stat-icon">
            💊
          </div>

          <div>
            <strong>
              {medicines.length}+
            </strong>

            <span>
              Medicines
            </span>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            🏷️
          </div>

          <div>
            <strong>
              {categories.length - 1}+
            </strong>

            <span>
              Categories
            </span>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            🤖
          </div>

          <div>
            <strong>AI</strong>

            <span>
              Medicine Assistant
            </span>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            🔒
          </div>

          <div>
            <strong>
              Secure
            </strong>

            <span>
              Ordering
            </span>
          </div>

        </div>

      </section>


      {/* =====================================
          SEARCH + SORT
      ====================================== */}

      <section className="medicine-toolbar">

        <div className="medicine-search">

          <Search size={19} />

          <input
            type="text"
            placeholder="Search medicine, category or manufacturer..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (

            <button
              className="clear-search"
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>

          )}

        </div>


        <div className="medicine-filter">

          <SlidersHorizontal size={18} />

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
          >

            <option value="default">
              Sort by
            </option>

            <option value="low">
              Price: Low to High
            </option>

            <option value="high">
              Price: High to Low
            </option>

          </select>

        </div>

      </section>


      {/* =====================================
          CATEGORY
      ====================================== */}

      <section className="category-section">

        <div className="category-heading">

          <div>

            <h2>
              Browse by Category
            </h2>

            <p>
              Find medicines based on your needs
            </p>

          </div>

          <span className="medicine-count">
            {filteredMedicines.length} medicines
          </span>

        </div>


        <div className="category-filter">

          {categories.map((item) => (

            <button
              key={item}
              className={
                category === item
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCategory(item)
              }
            >
              {item}
            </button>

          ))}

        </div>

      </section>


      {/* =====================================
          ERROR
      ====================================== */}

      {error && (

        <div className="medicine-error">

          <PackageSearch size={25} />

          <div>

            <strong>
              Something went wrong
            </strong>

            <p>{error}</p>

          </div>

        </div>

      )}


      {/* =====================================
          EMPTY SEARCH RESULT
      ====================================== */}

      {!error &&
        filteredMedicines.length === 0 && (

          <div className="medicine-empty">

            <div className="empty-icon">
              <Search size={30} />
            </div>

            <h2>
              No medicines found
            </h2>

            <p>
              Try searching with a different
              medicine name or category.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
                setSort("default");
              }}
            >
              Clear Filters
              <ArrowRight size={17} />
            </button>

          </div>

        )}


      {/* =====================================
          MEDICINE GRID
      ====================================== */}

      {!error &&
        filteredMedicines.length > 0 && (

          <section className="medicine-section">

            <div className="medicine-section-heading">

              <div>

                <span>
                  AVAILABLE MEDICINES
                </span>

                <h2>
                  Choose what you need
                </h2>

              </div>

              <button
                className="view-cart-top"
                onClick={() =>
                  navigate("/cart")
                }
              >
                <ShoppingCart size={17} />
                My Cart
              </button>

            </div>


            <div className="medicine-grid">

              {filteredMedicines.map(
                (medicine) => (

                  <MedicineCard
                    key={medicine._id}
                    medicine={medicine}
                    onAddToCart={
                      handleAddToCart
                    }
                  />

                )
              )}

            </div>

          </section>

        )}


      {/* =====================================
          AI MEDICINE ASSISTANT
      ====================================== */}

      <section className="ai-section">

        <AIAssistant />

      </section>

    </div>
  );
}

export default Medicines;