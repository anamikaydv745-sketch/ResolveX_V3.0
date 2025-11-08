import os
import json
import base64
import re
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai

# Initialize the Flask app and enable CORS
app = Flask(__name__, static_folder='../frontend/dist', template_folder='../frontend/dist')
CORS(app)

# Configure OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/')
def serve_index():
    return send_from_directory(app.template_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# ✅ Chatbot route
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
                "Your role is to guide users on civic issues. \n\n"
                "Your role is to guide users on how to report civic issues . \n\n"
                "If user is not asking about something other , you can also assist with that like in our portal they can track their report , they can also upvote or downvote a existing report done by any another . \n\n"
                "Their is also multilingual feature in our website , user can change the language of website . \n\n"
                "Instructions:\n"
                "If user is not asking on how to report then do no tell about how to report."
                "While telling on how to report do not tell how we will analze it."
                "1. By default, explain ONLY the photo upload method: The user can click/upload a photo, "
                "the AI analyzes it, auto-fills the issue details, asks for location permission, and submits the report.\n"
                "2. If (and only if) the user asks for another method (e.g., 'koi aur method?', 'any other way?', 'how else?'), "
                "then describe the second method: Going to the report page, filling details manually (issue type, description, location), and submitting.\n"
                "3. Keep answers short, clear, and step-by-step.\n"
                "4. Do not give unnecessary information or extra details outside the reporting process.\n"
                "5. Keep the tone supportive and simple."
            ),
        },
        {"role": "user", "content": user_msg},
    ],
)


        reply = response.choices[0].message["content"]
        return jsonify({"reply": reply})

    except Exception as e:
        print(f"💥 Chatbot Error: {e}")
        return jsonify({"reply": "❌ Server error, please try again later."}), 500


@app.route("/process", methods=["POST"])
def process_media():
    try:
        print("🔹 Received request at /process")

        if "file" not in request.files:
            print("❌ No file found in request")
            return jsonify({"error": "No file uploaded"}), 400

        uploaded_file = request.files["file"]
        kind = request.form.get("kind", "image")
        print(f"📂 File received: {uploaded_file.filename}, kind={kind}")

        # Allowed categories (must match your dropdown exactly)
        allowed_categories = [
            "Pothole",
            "Street Light",
            "Garbage/Waste",
            "Traffic Signal",
            "Sidewalk",
            "Water Issue",
            "Other"
        ]

        # Priority mapping (you can tweak)
        high_priority_categories = {"Pothole", "Traffic Signal"}

        # Keyword mapping (ordered — first match wins)
        # Expand these keywords if you see unmapped GPT outputs in future
        mapping_keywords = [
            (["pothole", "hole", "sinkhole", "manhole", "roadway", "road maintenance", "asphalt", "pavement", "crack", "cracked", "deterioration", "depression"], "Pothole"),
            (["street light", "streetlight", "lamp", "lamp post", "pole", "light not working", "bulb"], "Street Light"),
            (["garbage", "trash", "waste", "dump", "rubbish", "dumping"], "Garbage/Waste"),
            (["traffic signal", "signal", "traffic light", "signal not working", "lights stuck"], "Traffic Signal"),
            (["sidewalk", "footpath", "pavement (sidewalk)", "walkway", "pedestrian path"], "Sidewalk"),
            (["water", "sewage", "drain", "drainage", "flood", "leak", "water leak", "overflow"], "Water Issue"),
        ]

        if kind == "image":
            file_bytes = uploaded_file.read()
            print(f"🖼️ Image size: {len(file_bytes)} bytes")

            base64_image = base64.b64encode(file_bytes).decode("utf-8")

            # Strong prompt: instruct model to return one of the allowed categories only.
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an assistant that extracts civic issue details from an image. "
                            "Return a JSON object with exactly these keys: "
                            "'issue_title', 'issue_category', and 'detailed_description'.\n\n"
                            "IMPORTANT: 'issue_category' must be exactly one of the following values "
                            "— Pothole, Street Light, Garbage/Waste, Traffic Signal, Sidewalk, Water Issue, Other. "
                            "If none of these match, use 'Other'. Respond ONLY with the JSON object (no extra text)."
                        )
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Extract issue_title, issue_category, and detailed_description from this image. Respond only with the JSON object."},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                        ]
                    }
                ],
                response_format={"type": "json_object"}
            )

            print("✅ OpenAI API response received")
            raw_content = response.choices[0].message["content"]
            print(f"📦 Raw response: {raw_content}")

            # parsed response — model may return dict already or a JSON-string
            if isinstance(raw_content, dict):
                extracted_data = raw_content
            else:
                try:
                    extracted_data = json.loads(raw_content)
                except Exception as e:
                    # If parsing fails, fall back to safe defaults
                    print(f"⚠️ Failed to parse model JSON: {e}")
                    extracted_data = {
                        "issue_title": "",
                        "issue_category": "",
                        "detailed_description": ""
                    }

            # Normalize values to strings
            title = (extracted_data.get("issue_title") or "").strip()
            gpt_category_raw = (extracted_data.get("issue_category") or "").strip()
            description = (extracted_data.get("detailed_description") or "").strip()

            # 1) If model already returned an allowed category exactly, accept it
            mapped_category = None
            for cat in allowed_categories:
                if gpt_category_raw.lower() == cat.lower():
                    mapped_category = cat
                    print(f"🔁 Model returned allowed category directly: {mapped_category}")
                    break

            # 2) If not exact, check if model returned text that contains an allowed category name
            if not mapped_category and gpt_category_raw:
                for cat in allowed_categories:
                    if cat.lower() in gpt_category_raw.lower():
                        mapped_category = cat
                        print(f"🔁 Model category contained allowed name -> mapped to: {mapped_category}")
                        break

            # 3) Deep keyword scan across title, model-category and description
            if not mapped_category:
                combined_text = " ".join([title, gpt_category_raw, description]).lower()
                for keywords, target_cat in mapping_keywords:
                    for kw in keywords:
                        if kw in combined_text:
                            mapped_category = target_cat
                            print(f"🔍 Keyword match '{kw}' -> {target_cat}")
                            break
                    if mapped_category:
                        break

            # 4) Final fallback: Other
            if not mapped_category:
                mapped_category = "Other"
                print("⚠️ No mapping found — defaulting to 'Other'")

            # Build final response object with sanitized fields
            final = {
                "issue_title": title or (description[:80] + "...") if description else "Untitled",
                "issue_category": mapped_category,
                "detailed_description": description,
                "priority": "high" if mapped_category in high_priority_categories else "medium"
            }

            print(f"➡️ Final payload: {final}")
            return jsonify(final)

        elif kind == "video":
            print("🎥 Video received, skipping analysis for now")
            return jsonify({
                "issue_title": "Video Report",
                "issue_category": "Other",
                "detailed_description": "Video uploaded. Image-based analysis not implemented for video yet.",
                "priority": "medium"
            })

        else:
            return jsonify({"error": f"Unsupported media kind: {kind}"}), 400

    except Exception as e:
        print(f"💥 ERROR: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/moderate", methods=["POST"])
def moderate_report():
    try:
        data = request.json
        title = data.get("title", "")
        description = data.get("description", "")
        images = data.get("images", [])

        # Combine text fields
        text = f"{title}\n{description}"

        # 1️⃣ Harmful/unsafe content check (text moderation)
        response = openai.Moderation.create(
            model="text-moderation-latest",   # in 0.28, it's openai.Moderation.create
            input=text
        )
        flagged = response["results"][0]["flagged"]
        if flagged:
            return jsonify({"status": "spam", "message": "Inappropriate or harmful report detected"}), 200

        # 2️⃣ Custom GPT check for gibberish/spam
        relevance_prompt = f"""
        You are validating a civic issue report.
        Title: "{title}"
        Description: "{description}"

        Rules:
        - If the text is gibberish (random letters like "asdfghjwertyu"), mark as SPAM.
        - If it's unrelated to civic/community issues (roads, garbage, water, street lights, etc.), mark as SPAM.
        - Otherwise mark as VALID.
        Answer with only one word: SPAM or VALID.
        """

        relevance_check = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # available in 0.28
            messages=[{"role": "user", "content": relevance_prompt}]
        )

        decision = relevance_check["choices"][0]["message"]["content"].strip().upper()

        if decision == "SPAM":
            return jsonify({"status": "spam", "message": "This looks like gibberish or irrelevant spam"}), 200

        # 3️⃣ Optional: Image moderation (only works for text in 0.28, no direct image moderation API)
        for img_b64 in images:
            try:
                # NOTE: In openai 0.28, direct image moderation isn't supported.
                # A workaround is to describe the image via GPT first, then moderate the description.
                # Here, we'll just skip or run moderation on placeholder text.
                img_desc = "User uploaded an image related to the report."
                img_response = openai.Moderation.create(
                    model="text-moderation-latest",
                    input=img_desc
                )
                if img_response["results"][0]["flagged"]:
                    return jsonify({"status": "spam", "message": "Inappropriate or harmful image detected"}), 200
            except Exception as e:
                return jsonify({"status": "error", "message": f"Image check failed: {str(e)}"}), 500

        # ✅ If all checks passed
        return jsonify({"status": "ok", "message": "Report is valid"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)