// Converts and appends message to chat box
export function appendMessage(sender, text, type) {
  const chatBox = document.getElementById("chat-box");

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;

  if (type === "bot") {
    const html = marked.parse(text); // Ensure marked.js is included in your HTML
    messageDiv.innerHTML = `<strong>${sender}:</strong><br>${html}`;
  } else {
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  }

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

export function saveChatToLocalStorage(messages) {
  localStorage.setItem("chatMessages", JSON.stringify(messages));
}

export function loadChatFromLocalStorage() {
  const saved = localStorage.getItem("chatMessages");
  if (saved) {
    const savedMessages = JSON.parse(saved);
    savedMessages.forEach((msg) => {
      appendMessage(msg.role === "user" ? "You" : "Bot", msg.content, msg.role);
    });
    return savedMessages;
  }
  return [];
}

export function clearChatUi() {
  document.getElementById("chat-box").innerHTML = "";
  console.log("clearChatUI called");
  localStorage.removeItem("chatMessages");
  return "Chat cleared successfully.";
}

export function showToast(message, timeout = 3000) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, timeout);
}
