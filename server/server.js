import express from "express";

import { updateVersion, getModels, modelExist, addModel, removeModel, think, clear } from "./helper.js";

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

    const updatedModel = updateVersion(model);

    try {
        if (!modelExist(updatedModel))
            await addModel(updatedModel);

        const ollama_res = await think(updatedModel, prompt);

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

app.post("/api/remove", async (req, res) => {
    const model = req.body.model;

    if (!model)
        return res.status(400).json({ error: "Missing \"model\"" });

    const updatedModel = updateVersion(model);

    try {
        if (!modelExist(updatedModel))
            return res.status(404).json({ error: "Model not installed or doesn't exists" });

        await removeModel(updatedModel);

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
