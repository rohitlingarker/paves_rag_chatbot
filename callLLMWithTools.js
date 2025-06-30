import { chatCompletion } from "./callLLM.js";
import { showToast } from "./utils.js"; // function to show toast
import { clearChatUi } from "./utils.js"; // local tool logic
import { tools } from "./tools.js"; // Import tools if needed

export async function callLLMWithTools(messages) {
  

//   const toolsList = [/* your tool schemas here */];

  const response = await chatCompletion(messages, "meta-llama/llama-4-scout-17b-16e-instruct", tools);

  const data = await response.json();
  const choice = data.choices[0];

  // Case: LLM wants to call a tool
  if (choice.finish_reason === "tool_calls") {
    const toolCall = choice.message.tool_calls[0];
    const { name, arguments: argsStr } = toolCall.function;

    showToast(`Bot used tool: ${name}`);

    const args = JSON.parse(argsStr);
    let toolResult;

    // Call the actual tool
    switch (name) {
      case "clearChatUi":
        toolResult = clearChatUi(); // maybe return confirmation text
        break;
      default:
        toolResult = "Tool not implemented.";
    }

    // Send tool response back to LLM
    messages.push({
      role: "assistant",
      tool_calls: [toolCall],
    });
    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult),
    });

    const finalResponse = await chatCompletion(messages, "meta-llama/llama-4-scout-17b-16e-instruct", tools);
    const finalData = await finalResponse.json();
    return {
      reply: finalData.choices[0].message.content,
      tool: name,
    };
  }

  // No tool call, just respond
  return {
    reply: choice.message.content,
  };
}
