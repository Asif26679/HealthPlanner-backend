// backend/controllers/chatController.js
import dotenv from "dotenv";
dotenv.config();

// Self-reply chat controller
export const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "Messages are required and must be an array.",
      });
    }

    // User का last message लो
    const userMessage = messages[messages.length - 1].content;
    let reply = "";

    if (userMessage.toLowerCase().includes("hello")) {
      reply = "Hello! How are you?";
    } else if (userMessage.toLowerCase().includes("bye")) {
      reply = "Goodbye! Have a nice day!";
    } else if (userMessage.toLowerCase().includes("help")) {
      reply = "Sure! You can type anything and I will echo it back.";
    } else {
      // Default: echo the user message
      reply = `You said: "${userMessage}"`;
    }

    res.json({ reply });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "AI unavailable" });
  }
};
