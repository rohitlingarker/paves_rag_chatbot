import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GROQ_API_KEY")

def call_llm(messages, tools=False):
    url = "https://api.groq.com/openai/v1/chat/completions"
    
    payload = {
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "messages": messages,
        "max_tokens": 1000
    }

    if tools:
        payload["tools"] = [
            {
                "type": "function",
                "function": {
                    "name": "clear_chat",
                    "description": "Clear the chat history",
                    "parameters": {
                        "type": "object",
                        "properties": {}  # No parameters
                    }
                }
            }
        ]
        payload["tool_choice"] = "auto"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    res = requests.post(url, json=payload, headers=headers)
    res.raise_for_status()
    data = res.json()

    message = data["choices"][0]["message"]

    if "tool_calls" in message:
        tool_call = message["tool_calls"][0]
        tool_name = tool_call["function"]["name"]
        args = tool_call["function"].get("arguments", "{}")
        try:
            parsed_args = json.loads(args) if isinstance(args, str) else args
        except Exception:
            parsed_args = {}

        return {
            "tool": tool_name,
            **parsed_args
        }

    return {"reply": message.get("content", "No reply")}
