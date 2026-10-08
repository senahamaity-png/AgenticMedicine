const OpenAI = require("openai");

const {
  searchMedicine,
  checkStock,
  getMedicineDetails,
  getCart,
  addToCart,
  getOrderStatus
} = require("../tools/medicineTools");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});


// ===============================
// AI TOOL DEFINITIONS
// ===============================

const tools = [
  {
    type: "function",
    function: {
      name: "searchMedicine",
      description:
        "Search medicines by name, category, or manufacturer.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Medicine name, category, or manufacturer"
          }
        },
        required: ["query"]
      }
    }
  },

  {
    type: "function",
    function: {
      name: "checkStock",
      description:
        "Check the available stock of a specific medicine.",
      parameters: {
        type: "object",
        properties: {
          medicineId: {
            type: "string",
            description:
              "MongoDB medicine ID"
          }
        },
        required: ["medicineId"]
      }
    }
  },

  {
    type: "function",
    function: {
      name: "getMedicineDetails",
      description:
        "Get complete information about a medicine.",
      parameters: {
        type: "object",
        properties: {
          medicineId: {
            type: "string",
            description:
              "MongoDB medicine ID"
          }
        },
        required: ["medicineId"]
      }
    }
  },

  {
    type: "function",
    function: {
      name: "getCart",
      description:
        "Get the currently logged-in user's shopping cart.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },

  {
    type: "function",
    function: {
      name: "addToCart",
      description:
        "Add a medicine to the currently logged-in user's cart.",
      parameters: {
        type: "object",
        properties: {
          medicineId: {
            type: "string",
            description:
              "MongoDB medicine ID"
          },
          quantity: {
            type: "number",
            description:
              "Quantity to add"
          }
        },
        required: [
          "medicineId",
          "quantity"
        ]
      }
    }
  },

  {
    type: "function",
    function: {
      name: "getOrderStatus",
      description:
        "Get the status of an order belonging to the logged-in user.",
      parameters: {
        type: "object",
        properties: {
          orderId: {
            type: "string",
            description:
              "MongoDB order ID"
          }
        },
        required: ["orderId"]
      }
    }
  }
];


// ===============================
// MAIN AI AGENT
// ===============================

async function medicineAgent(message, userId) {
  try {

    const messages = [

      {
        role: "system",

        content: `
You are an AI assistant for an online medicine ordering application.

You can help users with:

1. Searching medicines
2. Getting medicine details
3. Checking medicine stock
4. Viewing the user's cart
5. Adding medicines to the user's cart
6. Checking order status

IMPORTANT RULES:

- Always use tools for real medicine information.
- Never invent medicine names, prices, stock, cart information, or order status.
- All prices are in Indian Rupees (₹). Never use dollars ($).
- Always display medicine and order prices using ₹.

SEARCH:
If the user asks to search, find, or check whether a medicine exists,
use searchMedicine.

STOCK:
If the user asks whether a medicine is available or asks about stock,
use searchMedicine first.
If a medicine is found, use checkStock.

ADD TO CART:
If the user explicitly asks to add a medicine to the cart,
you MUST perform the cart action.

For an add-to-cart request:
1. Use searchMedicine to find the medicine.
2. Get the medicine ID from the search result.
3. If the medicine exists and stock is sufficient,
   MUST call addToCart.
4. Use the quantity requested by the user.
5. Only after addToCart succeeds, tell the user that the medicine was added.
6. Do NOT answer only with stock information when the user asked to add something.

If the user says:
"Add Calcium + Vitamin D3 to my cart"
you should search for the medicine and then call addToCart.

CART:
If the user asks to see their cart,
use getCart.

ORDER:
If the user asks about an order,
use getOrderStatus.

MEDICAL SAFETY:
Do not diagnose diseases.
Do not prescribe medicines.
Do not recommend medicines as a doctor.
For diagnosis or treatment advice, recommend consulting a qualified healthcare professional.

Keep responses short, clear and helpful.
`
      },

      {
        role: "user",
        content: message
      }

    ];


    // =====================================
    // MULTI-STEP AGENT LOOP
    // =====================================

    for (let round = 0; round < 5; round++) {

      console.log(
        `AI Agent Round: ${round + 1}`
      );


      // Ask AI what to do
      const response =
        await client.chat.completions.create({

          model: "openai/gpt-4o-mini",

          messages,

          tools,

          tool_choice: "auto"

        });


      const assistantMessage =
        response.choices[0].message;


      // =====================================
      // NO TOOL REQUIRED
      // =====================================

      if (
        !assistantMessage.tool_calls ||
        assistantMessage.tool_calls.length === 0
      ) {

        return (
          assistantMessage.content ||
          "I couldn't process your request."
        );

      }


      // Add assistant tool-call message
      messages.push(assistantMessage);


      // =====================================
      // EXECUTE TOOL CALLS
      // =====================================

      for (
        const toolCall
        of assistantMessage.tool_calls
      ) {

        const functionName =
          toolCall.function.name;


        let args = {};


        // Safely parse arguments
        try {

          args = JSON.parse(
            toolCall.function.arguments || "{}"
          );

        } catch (error) {

          console.error(
            "Tool argument parsing error:",
            error
          );

        }


        console.log(
          "AI Tool:",
          functionName
        );

        console.log(
          "Tool Arguments:",
          args
        );


        let result;


        // =====================================
        // SEARCH MEDICINE
        // =====================================

        switch (functionName) {

          case "searchMedicine":

            result =
              await searchMedicine(
                args.query
              );

            break;


          // =====================================
          // CHECK STOCK
          // =====================================

          case "checkStock":

            result =
              await checkStock(
                args.medicineId
              );

            break;


          // =====================================
          // MEDICINE DETAILS
          // =====================================

          case "getMedicineDetails":

            result =
              await getMedicineDetails(
                args.medicineId
              );

            break;


          // =====================================
          // GET CART
          // =====================================

          case "getCart":

            result =
              await getCart(
                userId
              );

            break;


          // =====================================
          // ADD TO CART
          // =====================================

          case "addToCart":

            result =
              await addToCart(
                userId,
                args.medicineId,
                args.quantity
              );

            break;


          // =====================================
          // ORDER STATUS
          // =====================================

          case "getOrderStatus":

            result =
              await getOrderStatus(
                userId,
                args.orderId
              );

            break;


          // =====================================
          // UNKNOWN TOOL
          // =====================================

          default:

            result = {
              success: false,
              message:
                "Unknown tool requested"
            };

        }


        console.log(
          "Tool Result:",
          result
        );


        // =====================================
        // SEND TOOL RESULT BACK TO AI
        // =====================================

        messages.push({

          role: "tool",

          tool_call_id:
            toolCall.id,

          content:
            JSON.stringify(result)

        });

      }

      // Loop continues here.
      // AI can now decide whether another
      // tool is required or it can answer.

    }


    // =====================================
    // MAX TOOL LIMIT
    // =====================================

    return (
      "I could not complete your request after multiple tool calls."
    );


  } catch (error) {

    console.error(
      "Medicine Agent Error:",
      error
    );

    throw new Error(
      "AI service currently unavailable"
    );

  }
}


module.exports = medicineAgent;