from flask import Flask, render_template, request, jsonify
from rag_utils import generate_rag_context
from call_llm import call_llm
from router import route_query

app = Flask(__name__, static_url_path="/static", static_folder="static", template_folder="templates")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    query = data.get("query", "")
    messages = data.get("messages", [])

    route = route_query(query, messages)
    print(f"[Router] Routed to: {route}")

    try:
        if route == "rag":
            context = generate_rag_context(query)
            contextual_messages = [
                {
                    "role": "system",
                    "content": f"""
                    You are an AI assistant chatbot representing Paves Technologies.
You speak as part of the company, using "we" and "our" when referring to the organization.
Your tone is professional, warm, and helpful.
Here is some internal knowledge and company context you can use to answer questions:

{context}
                    """,
                },
                {
                    "role": "user",
                    "content": query,
                },
            ]
            response = call_llm(contextual_messages)
        elif route == "tool":
            response = call_llm(messages, tools=True)
        else:
            response = call_llm(messages)

        response["route"] = route  # Include the route in the response
        return jsonify(response)
    except Exception as e:
        print("Error:", e)
        return jsonify({"reply": "An error occurred while processing your request."})

if __name__ == "__main__":
    app.run(debug=True)
