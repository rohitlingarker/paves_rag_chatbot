import { clearChatUi } from "./utils.js";

export const tools = [
  {
    type: "function",
    function: {
      name: "clear_chat",
      description: "Clear the chat messages from the UI screen.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];

export const toolFunctions = {
  clear_chat: () => clearChatUi(),
};
