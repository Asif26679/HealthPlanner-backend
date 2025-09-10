import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

export const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages are required and must be an array." });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile", // या कोई और Groq model
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    const data = await response.json();
    console.log("Groq Response:", data);

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const aiMessage = data.choices?.[0]?.message?.content || "No response";
    res.json({ reply: aiMessage });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "AI unavailable" });
  }
};

