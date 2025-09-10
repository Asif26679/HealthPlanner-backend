// backend/controllers/chatController.js
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

export const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "Messages are required and must be an array.",
      });
    }

    // User ka last message lo
    const userMessage = messages[messages.length - 1].content;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.OPENAI_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userMessage }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(400).json(data.error);
    }

    res.json({
      reply: data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "AI unavailable" });
  }
};

