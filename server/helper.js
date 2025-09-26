import ollama from "ollama";

let history = []; // Chat history
let models = new Set();

async function getModels() {
    const modelList = await ollama.list()

    modelList.models.forEach((model) => {
        models.add(model.model);
    });
}

function updateVersion(model) {
    if (!model.includes(":"))
        return `${model}:latest`

    return model
}

function modelExist(model) {
    if (models.has(model))
        return true

    return false
}

async function addModel(model) {
    console.log("Downloading model...");

    await ollama.pull({ model: model });

    models.add(model);
}

async function removeModel(model) {
    console.log("Removing model...");

    await ollama.delete({ model: model });

    models.delete(model);
}

async function think(model, prompt) {
    console.log("Thinking...");

    // Add user response to chat history
    history.push({ role: "user", content: prompt });

    const response = await ollama.chat({
        model: model,
        messages: history
    });

    const ollama_res = response.message.content;

    // Add Ollama's response to chat history
    history.push({ role: "assistant", content: ollama_res })

    return ollama_res
}

function clear() {
    console.log("Clearing chat history...");

    history = [];
}

export { updateVersion, getModels, modelExist, addModel, removeModel, think, clear };
