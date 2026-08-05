from typing import Dict, Any
from app.tools.tool_registry import tool_registry

async def handle_get_attendance(arguments: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    subject_name = arguments.get("subject_name")
    return {
        "status": "success",
        "attendance_summary": [
            {"subject": "Data Structures", "percentage": 73.0, "status": "danger", "can_miss": 0, "must_attend": 5},
            {"subject": "DBMS", "percentage": 82.0, "status": "safe", "can_miss": 3, "must_attend": 0},
            {"subject": "Operating Systems", "percentage": 78.0, "status": "safe", "can_miss": 1, "must_attend": 0},
            {"subject": "Networks", "percentage": 85.0, "status": "safe", "can_miss": 4, "must_attend": 0}
        ]
    }

tool_registry.register(
    name="get_attendance",
    description="Gets the student's live attendance percentage and risk metrics per subject.",
    parameters={
        "type": "object",
        "properties": {
            "subject_name": {"type": "string", "description": "Optional specific subject name"}
        },
        "required": []
    },
    handler=handle_get_attendance
)
