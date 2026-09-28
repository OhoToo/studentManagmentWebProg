

from flask import Flask, request, jsonify

app = Flask(__name__)


STUDENTS = [
    {"isu_id": 111, "name": "Алексей", "group": "M3301"},
    {"isu_id": 222, "name": "Мария", "group": "M3302"}
]


@app.route("/search")
def search_student():
    target_group = request.args.get("group")
    
    if not target_group:
        return jsonify({"error": "Передайте параметр group, например: /search?group=M3301"}), 400


    filtered = []
    for s in STUDENTS:
        if s["group"] == target_group:
            filtered.append(s)
            
    return jsonify(filtered), 200

if __name__ == "__main__":
    app.run(debug=True)
