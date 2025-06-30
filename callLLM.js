const API_KEY = "__API_KEY__"; 

async function chatCompletion(
  messages,
  model = "llama-3.3-70b-versatile",
  tools = []
) {
  return await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      tool_choice: "auto",
      max_tokens: 1000,
    }),
  });
}

export async function callLLM(messages,tools=[]) {
  const response = await chatCompletion(messages, "llama-3.3-70b-versatile", tools);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API Error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const message = data.choices[0].message;

  // Handle function call
  if (message.tool_calls && message.tool_calls.length > 0) {
    const toolCall = message.tool_calls[0];
    return {
      tool: toolCall.function.name,
      args: JSON.parse(toolCall.function.arguments),
    };
  }

  // Normal message
  return {
    reply: message.content,
  };
}

// export chatCompletion
export { chatCompletion };