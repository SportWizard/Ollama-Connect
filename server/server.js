import express from "express";
import ollama from "ollama";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 12345;
const HOST = process.env.HOST || "0.0.0.0";

// Chat history
let history = [];

let models = [];

async function getModels() {
    const modelList = await ollama.list()

    modelList.models.forEach((model) => {
        models.push(model.model);
    });
}

async function checkAndAddModel(model) {
    if (model) {
        if (!model.includes(":"))
            model += ":latest"

        if (!models.includes(model)) {
            console.log("Downloading model...");

            await ollama.pull({ model: model });
        }
    }
}

app.post("/api/chat", async (req, res) => {
    const prompt = req.body.prompt;
    const model = req.body.model;

    // Exit early if prompt is not provided
    if (!prompt)
        return res.status(400).json({ error: "Missing \"prompt\"" });

    try {
        await checkAndAddModel(model);

        console.log("Thinking...")

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

        console.log("Done");
    }
    catch (err) {
        if (err.message == "pull model manifest: file does not exist") {
            console.log(`Failed: model does not exists in Ollama library`);
            res.status(400).json({ error: "Model does not exists in Ollama library" });
        }
        else {
            console.error("Error:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

app.post("/api/clear", (req, res) => {
    try {
        console.log("Cleaning chat history...");

        history = [];

        res.status(200).json({ msg: "Success" });

        console.log("Done");
    }
    catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, HOST, () => {
    getModels();
    console.log(`Server started on port ${PORT}`)
});
