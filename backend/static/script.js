import {
  appendMessage,
  saveChatToLocalStorage,
  clearChatUi,
  showToast,
} from "./utils.js";

let messages = [];

document.getElementById("send-button").addEventListener("click", sendMessage);
document
  .getElementById("user-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      sendMessage();
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

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: userInput, messages }),
    });

    const data = await res.json();
    if (data.route) {
      showToast(`Router: ${data.route}`); // or "success" / "warning"
    }

    // ✅ Handle tool call response
    if (data.tool === "clear_chat") {
      clearChatUi();
      messages = [];
      saveChatToLocalStorage(messages);
      appendMessage("Bot", "Chat has been cleared.", "bot");
      return;
    }

    // ✅ Normal bot reply
    const botReply = data.reply;
    appendMessage("Bot", botReply, "bot");
    messages.push({ role: "assistant", content: botReply });
    saveChatToLocalStorage(messages);
  } catch (err) {
    console.error("Error:", err);
    appendMessage(
      "Bot",
      "An error occurred while processing your message.",
      "bot"
    );
  }
}
