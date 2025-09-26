import express from "express";

import { getModels, modelExist, addModel, think, clear } from "./helper.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 12345;
const HOST = process.env.HOST || "0.0.0.0";

app.post("/api/chat", async (req, res) => {
    const model = req.body.model;
    const prompt = req.body.prompt;

    // Exit early if model and prompt is not provided
    if (!model)
        return res.status(400).json({ error: "Missing \"model\"" });

    if (!prompt)
        return res.status(400).json({ error: "Missing \"prompt\"" });

    try {
        if (!modelExist(model))
            await addModel(model);

        const ollama_res = await think(model, prompt);

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
        clear();

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
