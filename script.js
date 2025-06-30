import { callLLM } from "./callLLM.js";
import { callLLMWithTools } from "./callLLMWithTools.js";
import { routeQuery } from "./routeQuery.js";
import {
  saveChatToLocalStorage,
  loadChatFromLocalStorage,
  clearChatUi,
  appendMessage,
  showToast,
} from "./utils.js";
import { initRAG, generateRAGContext } from "./rag/retriever.js";

window.addEventListener("load", async () => {
  await initRAG(); // Initialize RAG before anything
  messages = loadChatFromLocalStorage() || messages;
});

document.getElementById("send-btn").addEventListener("click", sendMessage);
document
  .getElementById("user-input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

let messages = [];

// 🚀 Initialize on page load
window.addEventListener("load", async () => {
  messages = loadChatFromLocalStorage() || messages;

  try {
    await initRAG();
  } catch (err) {
    console.error("Failed to initialize RAG system:", err);
  }
});

async function sendMessage() {
  const inputField = document.getElementById("user-input");
  const userInput = inputField.value.trim();
  if (userInput === "") return;

  appendMessage("You", userInput, "user");
  messages.push({ role: "user", content: userInput });
  saveChatToLocalStorage(messages);
  inputField.value = "";

  const result = await handleUserInput(messages);
  const botReply = result.reply || result;
  appendMessage("Bot", botReply, "bot");
  messages.push({ role: "assistant", content: botReply });
  saveChatToLocalStorage(messages);
}

// 🧠 Core Routing Logic
async function handleUserInput(userInput) {
  const route = await routeQuery(userInput, messages);
  showToast(`Routing to: ${route}`, 2000);
  try {
    if (route === "general") {
      return await callLLM(messages); // expects { reply: ... }
    }

    if (route === "rag") {
      const context = await generateRAGContext(userInput);
      const contextualMessages = [
        {
          role: "system",
          content: `
            You are an AI assistant representing Paves Technologies. 
            Speak confidently as part of the company. 
            Use the provided context to answer questions naturally and helpfully, 
            without referencing the context or explaining where your knowledge comes from. 
            Be professional, warm, and clear in tone.
          `,
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${userInput}`,
        },
      ];
      return await callLLM(contextualMessages); // expects { reply: ... }
    }

    if (route === "tool") {
      const result = await callLLMWithTools(messages);
      console.log("Tool call result:", result);

      if (result.tool === "clear_chat") {
        clearChatUi(); // Clear UI and local storage
        messages = [];
        showToast("Chat cleared successfully.");
        return { reply: "Chat has been cleared!" };
      }

      return { reply: result.reply || "Tool executed successfully." };
    }

    return { reply: "I'm not sure how to handle that yet." };
  } catch (err) {
    console.error("Error handling input:", err);
    return {
      reply: "Oops! Something went wrong while processing your request.",
    };
  }
}
