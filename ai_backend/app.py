import os
import json
import base64
import re
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai

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
        user_msg = request.json.get("message", "")
        if not user_msg:
            return jsonify({"reply": "⚠️ Please enter a valid query."})

        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Civic AI Assistant for a civic issue reporting portal. "
                        "Your role is to guide users on civic issues, how to report them, "
                        "and how to use the platform. Be concise, friendly, and informative."
                    )
                },
                {"role": "user", "content": user_msg},
            ],
        )

        reply = response.choices[0].message["content"]
        return jsonify({"reply": reply})

    except Exception as e:
        print(f"💥 Chatbot Error: {e}")
        return jsonify({"reply": "❌ Server error, please try again later."}), 500


# ------------------------------------------------------------
# 🧠 Spam Detection Helpers
# ------------------------------------------------------------
def is_gibberish(text: str) -> bool:
    """Detect random or meaningless text."""
    if not text:
        return True
    # Too many consonants or special chars
    if re.search(r"[^aeiou\s]{6,}", text.lower()):
        return True
    # Random mixed-case nonsense
    if re.search(r"[A-Z]{3,}[a-z]{3,}", text):
        return True
    # Repeated meaningless words or short strings
    if len(text.split()) <= 2 and len(text) < 10:
        return True
    # Known junk patterns
    junk_words = ["asdf", "qwerty", "uyrithjalfy", "sd;ao9fucgq3jbc", "lorem", "dummy"]
    if any(j in text.lower() for j in junk_words):
        return True
    return False


# ------------------------------------------------------------
# 🧹 Process Image and Extract Waste Info (existing)
# ------------------------------------------------------------
@app.route("/process", methods=["POST"])
def process_media():
    try:
        print("🔹 Received request at /process")

        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        uploaded_file = request.files["file"]
        kind = request.form.get("kind", "image")

        allowed_categories = [
            "Pothole", "Street Light", "Garbage/Waste",
            "Traffic Signal", "Sidewalk", "Water Issue", "Other"
        ]
        high_priority = {"Pothole", "Traffic Signal"}

        if kind == "image":
            file_bytes = uploaded_file.read()
            base64_image = base64.b64encode(file_bytes).decode("utf-8")

            # 🔎 Ask GPT to describe what’s in the image
            gpt_check = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an image verifier for civic waste reports."},
                    {"role": "user", "content": [
                        {"type": "text", "text": "Describe this image briefly."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]}
                ]
            )
            image_desc = gpt_check.choices[0].message["content"].lower()
            print(f"🧩 Image description: {image_desc}")

            # 🚫 Detect non-waste (social/selfie/fun images)
            if any(word in image_desc for word in ["person", "selfie", "face", "human", "group", "fun", "social media", "party", "animal not waste"]):
                return jsonify({
                    "status": "spam",
                    "message": "This image does not appear to show waste or civic issue."
                }), 200

            # 🧠 Extract issue type if valid
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an assistant that extracts civic issue details from an image. "
                            "Return JSON with 'issue_title', 'issue_category', 'detailed_description'. "
                            "Allowed categories: Pothole, Street Light, Garbage/Waste, Traffic Signal, Sidewalk, Water Issue, Other."
                        ),
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Extract issue details as JSON."},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                        ],
                    },
                ],
                response_format={"type": "json_object"},
            )

            raw = response.choices[0].message["content"]
            try:
                parsed = json.loads(raw)
            except Exception:
                parsed = {"issue_title": "Untitled", "issue_category": "Other", "detailed_description": ""}

            cat = parsed.get("issue_category", "Other")
            if cat not in allowed_categories:
                cat = "Other"

            result = {
                "issue_title": parsed.get("issue_title", "Untitled"),
                "issue_category": cat,
                "detailed_description": parsed.get("detailed_description", ""),
                "priority": "high" if cat in high_priority else "medium"
            }

            return jsonify(result)

        elif kind == "video":
            return jsonify({
                "issue_title": "Video Report",
                "issue_category": "Other",
                "detailed_description": "Video uploaded (not analyzed).",
                "priority": "medium"
            })

        else:
            return jsonify({"error": "Unsupported media kind"}), 400

    except Exception as e:
        print(f"💥 ERROR: {e}")
        return jsonify({"error": str(e)}), 500


# ------------------------------------------------------------
# 🧠 Text + Image Spam Detection Endpoint
# ------------------------------------------------------------
@app.route("/moderate", methods=["POST"])
def moderate_report():
    try:
        data = request.json
        title = data.get("title", "")
        description = data.get("description", "")
        images = data.get("images", [])

        # 🧩 1️⃣ Local gibberish / nonsense check
        if is_gibberish(title) or is_gibberish(description):
            return jsonify({"status": "spam", "message": "Irrelevant or gibberish text detected"}), 200

        # 🧩 2️⃣ AI-based relevance check
        relevance_prompt = f"""
        You are validating a civic report.
        Title: "{title}"
        Description: "{description}"

        Rules:
        - If text is gibberish or meaningless, mark as SPAM.
        - If text unrelated to civic issues (waste, pothole, water, etc.), mark as SPAM.
        - Otherwise, mark VALID.
        Respond with only 'SPAM' or 'VALID'.
        """

        relevance_check = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": relevance_prompt}]
        )
        decision = relevance_check.choices[0].message["content"].strip().upper()

        if "SPAM" in decision:
            return jsonify({"status": "spam", "message": "Report looks irrelevant or invalid"}), 200

        # 🧩 3️⃣ Optional image validation again (fast)
        for img_b64 in images:
            img_check = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are checking if the uploaded image is civic issue related."},
                    {"role": "user", "content": [
                        {"type": "text", "text": "Does this image show waste, garbage, or civic issue? Answer YES or NO."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}}
                    ]}
                ]
            )
            answer = img_check.choices[0].message["content"].strip().lower()
            if "no" in answer:
                return jsonify({"status": "spam", "message": "Image seems unrelated to civic waste or issue"}), 200

        return jsonify({"status": "ok", "message": "Report is valid"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ------------------------------------------------------------
# Run server
# ------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5001)
