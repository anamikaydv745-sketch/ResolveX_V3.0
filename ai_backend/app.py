import os
import json
import base64
import re
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai
import pickle
import numpy as np
from werkzeug.utils import secure_filename
import base64
# Initialize Flask app
app = Flask(__name__, static_folder='../frontend/dist', template_folder='../frontend/dist')
CORS(app)

# Configure OpenAI key
openai.api_key = os.getenv("OPENAI_API_KEY")


# ------------------------------------------------------------
# Serve frontend files
# ------------------------------------------------------------
@app.route('/')
def serve_index():
    return send_from_directory(app.template_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)


# ------------------------------------------------------------
# Chatbot Route (as-is)
# ------------------------------------------------------------
@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_msg = request.json.get("message", "").strip()
        if not user_msg:
            return jsonify({"reply": "⚠️ Please enter a valid query."})

        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Civic AI Assistant for a civic issue reporting portal. "
                        "Report Waste Issues - Users can click on report waste issues and then open their camera, capture a waste image, and automatically "
                        "attach their live location to report the issue directly to local authorities. "
                        "The AI system analyzes the image to confirm it's waste-related before submission.\n"
                        "Test Water Quality – Users click on water testing and then their testing location is automatically fetched, select a water source type, "
                        "and input key water parameters including:\n"
                        "- pH Level (0–14)\n"
                        "- Turbidity (NTU)\n"
                        "- TDS(mg/L)\n"
                        "- Conductivity \n"
                        "- Hardness \n"
                        "- Coliform Presence\n"
                        "The AI analyzes these inputs to determine the overall water quality and provide suggestions "
                        "on whether the water is safe or needs treatment.\n\n"
                        "Check Air Quality Index (AQI) – Users can view real-time AQI levels for their current location which is shown in real time at all time in the top header . If any ask tell them this specific in short .\n\n"
                        "Your responsibilities:\n"
                        "- Greet users warmly and guide them through the platform.\n"
                        "- If someone is new or asks 'how to use', explain all main features simply.\n"
                        "- If they ask about reporting waste, explain the camera upload + live location process.\n"
                        "- If they ask about water testing, explain how to upload and analyze water.\n"
                        "- If they ask about AQI, explain what it means and where to find it.\n"
                        "- Stay civic-focused, positive, and helpful — encourage users to make a difference.\n\n"
                        "Always end responses with an encouraging line such as: "
                        "'🌱 Together, we can make our city cleaner and healthier!'"
                        "Tell in precise and do not use '**' and ':' and emoji in code . "
                        "Make the chat professional and tell in steps where needed ."
                    ),
                },
                {"role": "user", "content": user_msg},
            ],
        )

        reply = response.choices[0].message["content"].strip()
        return jsonify({"reply": reply})

    except Exception as e:
        print(f"💥 Chatbot Error: {e}")
        return jsonify({"reply": "❌ Server error, please try again later."}), 500

# ------------------------------------------------------------
# Log Water Testing
# ------------------------------------------------------------
# load model
with open("bagging_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)






@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    ph = float(data.get('ph', 7))
    turbidity = float(data.get('turbidity', 1))
    tds = float(data.get('tds', 300))
    conductivity = float(data.get('conductivity', 400))
    hardness = float(data.get('hardness', 150))
    coliform = data.get('coliform', "absent")

    # If coliform present or high, always "Poor"
    if coliform in ['present', 'high']:
        result = {
            "status": "Poor",
            "ph": ph,
            "turbidity": turbidity,
            "coliform": coliform,
            "recommendations": [
                "Action Required: Water is not safe for consumption.",
                "Notify local health authorities immediately.",
                "Boil water before use."
            ]
        }
    else:
        # Model expects array of the five features
        input_features = np.array([[ph, hardness, tds, conductivity, turbidity]])
        x_scaled = scaler.transform(input_features)
        pred = model.predict(x_scaled)  # Should output 1 for Good, 0 for Poor

        status = "Good" if pred[0]==1 else "Poor"
        recommendations = [
            "Water appears safe for general use."
        ] if status == "Good" else [
            "Action Required: Water is not safe for consumption.",
            "Notify local health authorities immediately.",
            "Boil water before use."
        ]
        result = {
            "status": status,
            "ph": ph,
            "turbidity": turbidity,
            "coliform": coliform,
            "recommendations": recommendations
        }

    return jsonify(result)






# Only these categories allowed for waste
allowed_categories = [
    "Biomedical",
    "Plastic",
    "Organic",
    "E-Waste",
    "Construction"
]

# Keyword mapping for accuracy (expandable)
mapping_keywords = [
    (["biomedical", "medical waste", "infectious", "clinical"], "Biomedical"),
    (["plastic", "polythene", "polymer", "plastic bag"], "Plastic"),
    (["organic", "compost", "food waste", "vegetable", "fruit", "biodegradable", "decomposition"], "Organic"),
    (["e-waste", "electronic", "appliance", "gadget", "circuit", "battery", "monitor", "mobile"], "E-Waste"),
    (["construction", "debris", "rubble", "brick", "cement", "demolition", "concrete"], "Construction"),
]

@app.route("/process", methods=["POST"])
def process_waste():
    try:
        if "file" not in request.files:
            return jsonify({"status": "error", "message": "No file uploaded"}), 400

        uploaded_file = request.files["file"]
        kind = request.form.get("kind", "image")

        if kind != "image":
            return jsonify({"status": "error", "message": "Only images are supported"}), 400

        file_bytes = uploaded_file.read()
        image_base64 = base64.b64encode(file_bytes).decode("utf-8")
        image_data_url = f"data:image/jpeg;base64,{image_base64}"

        # Strong prompt for OpenAI model
        prompt = (
            "You are an expert waste classifier. "
            "Classify the attached image into EXACTLY one of: Biomedical, Plastic, Organic, E-Waste, Construction. "
            "If the image does not look like any of those categories at all, reply ONLY with the word 'spam'. "
            "Otherwise, reply with category name ONLY (no explanation)."
        )

        response = openai.ChatCompletion.create(
            model="gpt-4o-mini", # highly accurate, latest, fast
            messages=[
                {
                    "role": "system",
                    "content": prompt
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Classify this image (reply with: one category or 'spam')."},
                        {"type": "image_url", "image_url": {"url": image_data_url}}
                    ]
                }
            ],
            max_tokens=10,
            timeout=30
        )

        result = response.choices[0].message["content"].strip().lower()
        print("OpenAI says:", result)

        mapped_category = None
        for cat in allowed_categories:
            if result == cat.lower():
                mapped_category = cat
                break
        if not mapped_category:
            for cat in allowed_categories:
                if cat.lower() in result:
                    mapped_category = cat
                    break

        if not mapped_category:
            for keywords, target_cat in mapping_keywords:
                for kw in keywords:
                    if kw in result:
                        mapped_category = target_cat
                        break
                if mapped_category:
                    break

        if mapped_category:
            return jsonify({"status": "ok", "issue_category": mapped_category}), 200

        # If spam or can't match, block image
        return jsonify({"status": "spam", "message": "Not a relevant waste photo, please upload another."}), 200

    except Exception as e:
        print("ERROR at /process:", e)
        return jsonify({"status": "error", "message": str(e)}), 500



@app.route("/moderate", methods=["POST"])
def moderate_report():
    data = request.get_json()
    landmark = data.get("landmark", "")
    description = data.get("description", "")

    user_text = f"Nearest Landmark: {landmark}\nAdditional Details: {description}"

    # Strong prompt to catch gibberish
    prompt = (
        "You are a strict civic report spam detector. "
        "If the given details are gibberish, random characters, meaningless words, or not a real place/description, reply only with 'spam'. "
        "If the details are meaningful, contain actual location or relevant problem info, reply only with 'clean'."
    )

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_text}
            ],
            max_tokens=5,
            timeout=30
        )
        result = response.choices[0].message["content"].strip().lower()
        print("GPT moderation result:", result)
        if "spam" in result:
            return jsonify({"status": "spam", "message": "Your report contains gibberish or irrelevant details. Please enter real information."})
        else:
            return jsonify({"status": "clean"})

    except Exception as e:
        print("Moderation error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500




# ------------------------------------------------------------
# Run server
# ------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5001)
