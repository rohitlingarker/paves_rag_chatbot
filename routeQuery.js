import { chatCompletion } from "./callLLM.js";

export async function routeQuery(query,messages) {
  const routerMessages = [
    {
      role: "system",
      content: `You are a smart query router for Paves Technologies' AI assistant.

Classify the user input into **one** of these categories:

1. "rag" - If the user asks anything about Paves Technologies, including:
   - company info, services, mission, values, leadership, team, culture, clients, projects
   - anything from/about its website (e.g., landing page, About section)
   - specific mentions of "Paves", "Paves Technologies", or "your company"

2. "tool" - If the user wants to **invoke a tool or perform an action**, like:
   - clearing the chat, generating a chart, doing calculations, performing a task

3. "general" - For everything else:
   - casual conversation, generic trivia, general knowledge, small talk

⚠️ Respond with only one word: "rag", "tool", or "general".

Examples:
- "Tell me about Paves Technologies." → rag  
- "What services does Paves offer?" → rag  
- "Can you clear this chat?" → tool  
- "What is the capital of Japan?" → general  
- "Hi there!" → general  
- "Create a pie chart for sales data" → tool  
- "Who is the CEO of Paves?" → rag  
- "What are your company values?" → rag
`,
    },
    ...messages
  ];

  const response = await chatCompletion(routerMessages, "meta-llama/llama-4-scout-17b-16e-instruct");
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API Error: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  
  const answer = data.choices[0].message.content.trim().toLowerCase();

  if (!["general", "rag", "tool"].includes(answer)) {
    return "general"; // Default to general if classification is invalid
  }

  return answer;
}
