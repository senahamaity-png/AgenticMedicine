import { useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Trash2,
  Search,
  PackageCheck,
  ShoppingCart,
  ClipboardList,
  Circle,
} from "lucide-react";

import api from "../services/api";

function AIAssistant() {
  const welcomeMessage = {
    role: "assistant",
    content:
      "Hello! 👋 I’m your Agentic AI Medicine Assistant. I can help you search medicines, check stock, manage your cart, and check order status.",
  };

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    welcomeMessage,
  ]);

  const [loading, setLoading] = useState(false);


  /* =========================================
     SEND MESSAGE
  ========================================= */

  const sendMessage = async (text) => {
    const userMessage = text.trim();

    if (!userMessage || loading) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await api.post(
        "/ai/chat",
        {
          message: userMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "AI FRONTEND RESPONSE:",
        response.data
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            response.data.reply ||
            "Sorry, I could not process your request.",
        },
      ]);
    } catch (error) {
      console.error(
        "AI Chat Error:",
        error
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.response?.data?.message ||
            "AI service is currently unavailable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  /* =========================================
     FORM SUBMIT
  ========================================= */

  const handleSend = async (e) => {
    e.preventDefault();

    await sendMessage(message);
  };


  /* =========================================
     QUICK ACTIONS
  ========================================= */

  const quickActions = [
    {
      label: "Search medicine",
      message: "Search for available medicines",
      icon: <Search size={15} />,
    },

    {
      label: "Check stock",
      message:
        "Check stock of Calcium + Vitamin D3",
      icon: <PackageCheck size={15} />,
    },

    {
      label: "Show my cart",
      message: "Show my cart",
      icon: <ShoppingCart size={15} />,
    },

    {
      label: "Order status",
      message:
        "Show my latest order status",
      icon: <ClipboardList size={15} />,
    },
  ];


  return (
    <section className="ai-assistant">


      {/* =====================================
          HEADER
      ====================================== */}

      <div className="ai-header">

        <div className="ai-header-left">


          {/* AGENTIC AI LOGO */}

          <div className="agentic-ai-logo">

            <div className="agentic-ai-glow"></div>

            <div className="agentic-ai-orbit orbit-one"></div>

            <div className="agentic-ai-orbit orbit-two"></div>


            <div className="agentic-ai-core">
              <Bot size={30} />
            </div>


            {/* AI NODES */}

            <span className="agentic-node node-one"></span>

            <span className="agentic-node node-two"></span>

            <span className="agentic-node node-three"></span>


            {/* MEDICINE */}

            <span className="agentic-pill">
              💊
            </span>

          </div>


          {/* TITLE */}

          <div className="ai-title-area">

            <div className="ai-title-row">

              <h2>
                Agentic AI Assistant
              </h2>

              <span className="ai-online">

                <Circle
                  size={8}
                  fill="currentColor"
                />

                Online

              </span>

            </div>


            <p>
              Smart assistance for medicines,
              stock, cart and orders.
            </p>

          </div>

        </div>


        {/* CLEAR */}

        <button
          className="ai-clear-button"
          onClick={() =>
            setMessages([welcomeMessage])
          }
        >
          <Trash2 size={15} />

          <span>
            Clear
          </span>
        </button>

      </div>


      {/* =====================================
          QUICK ACTIONS
      ====================================== */}

      <div className="ai-quick-section">

        <div className="ai-quick-title">

          <Sparkles size={14} />

          <span>
            Quick actions
          </span>

        </div>


        <div className="ai-quick-actions">

          {quickActions.map((action) => (

            <button
              key={action.label}
              className="ai-quick-button"
              onClick={() =>
                sendMessage(
                  action.message
                )
              }
              disabled={loading}
            >

              {action.icon}

              {action.label}

            </button>

          ))}

        </div>

      </div>


      {/* =====================================
          CHAT AREA
      ====================================== */}

      <div className="ai-messages">

        {messages.map(
          (item, index) => (

            <div
              key={index}
              className={`ai-message-row ${
                item.role === "user"
                  ? "user-row"
                  : "assistant-row"
              }`}
            >


              {/* AI AVATAR */}

              {item.role ===
                "assistant" && (

                <div className="ai-small-avatar">

                  <Bot size={16} />

                </div>

              )}


              {/* MESSAGE */}

              <div
                className={`ai-message ${
                  item.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >

                {item.content}

              </div>

            </div>

          )
        )}


        {/* =================================
            TYPING INDICATOR
        ================================== */}

        {loading && (

          <div className="ai-message-row assistant-row">

            <div className="ai-small-avatar">

              <Bot size={16} />

            </div>


            <div className="ai-message assistant-message typing-message">

              <span></span>

              <span></span>

              <span></span>

            </div>

          </div>

        )}

      </div>


      {/* =====================================
          INPUT
      ====================================== */}

      <form
        className="ai-input-area"
        onSubmit={handleSend}
      >

        <div className="ai-input-wrapper">

          <input
            type="text"
            placeholder="Ask about a medicine, stock, cart or order..."
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            disabled={loading}
          />


          <button
            type="submit"
            className="ai-send-button"
            disabled={
              loading ||
              !message.trim()
            }
          >

            <Send size={18} />

          </button>

        </div>


        <p className="ai-disclaimer">

          🤖 Agentic AI provides shopping
          assistance only. For medical advice,
          consult a healthcare professional.

        </p>

      </form>

    </section>
  );
}

export default AIAssistant;