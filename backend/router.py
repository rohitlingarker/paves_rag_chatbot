from call_llm import call_llm

def route_query(query, messages):
    router_messages = [
        {
            "role": "system",
            "content": """You are a smart query router for Paves Technologies' AI assistant.

Your task is to classify the user's query into **only one** of the following three categories:

1. "rag" – If the user asks anything about Paves Technologies, including:
   - company overview, services, mission, values, leadership, team, culture, clients, projects, or locations
   - any content that could be found on its website
   - mentions of "Paves", "Paves Technologies", or "your company"

2. "tool" – If the user is requesting an **action** to be performed, such as:
   - clearing or resetting the chat
   - generating charts, graphs, summaries, etc.
   - anything that invokes a tool or function

3. "general" – Everything else, including:
   - small talk, jokes, trivia, or factual questions unrelated to the company
   - questions about the assistant itself
   - greetings or casual conversation

🧠 Respond ONLY with one of the words: **"rag"**, **"tool"**, or **"general"**.
No explanations.

### Examples:
- "What does Paves Technologies do?" → rag  
- "Tell me about your company" → rag  
- "What are our core values?" → rag  
- "Clear the chat" → tool  
- "Reset the conversation" → tool  
- "Generate a bar chart of expenses" → tool  
- "What's the capital of France?" → general  
- "What's my name?" → general  
- "Tell me a joke" → general
"""
        },
        *messages
    ]

    response = call_llm(router_messages)
    reply = response["reply"].strip().lower()
    return reply if reply in ["rag", "tool", "general"] else "general"
