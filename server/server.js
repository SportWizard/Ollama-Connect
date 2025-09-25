import express from "express";
import ollama from "ollama";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 12345;
const HOST = process.env.HOST || "0.0.0.0";

// Chat history
let history = [];

app.post("/api/chat", async (req, res) => {
    const prompt = req.body.prompt;
    const model = req.body.model;

    // Exit early if prompt is not provided
    if (!prompt)
        return res.status(400).json({ error: "Missing \"prompt\"" });

    try {
        console.log("Processing a request...");

        // Add user response to chat history
        history.push({ role: "user", content: prompt });

        const response = await ollama.chat({
            model: model || "llama3.1",
            messages: history
        });

        const ollama_res = response.message.content;

        // Add Ollama's response to chat history
        history.push({ role: "assistant", content: ollama_res })

        res.status(200).json({ msg: ollama_res });
    }
    catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/clear", (req, res) => {
    try {
        history = [];

        res.status(200).json({ msg: "Success" });
    }
    catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Server started on port ${PORT}`)
});
