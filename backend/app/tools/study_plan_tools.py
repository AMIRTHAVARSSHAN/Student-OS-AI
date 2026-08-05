from typing import Dict, Any
from app.tools.tool_registry import tool_registry

async def handle_get_study_plan(arguments: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    date_str = arguments.get("date", "today")
    user_name = context.get("user_name", "Student")
    return {
        "status": "success",
        "date": date_str,
        "study_blocks": [
            {"time": "09:00 - 10:30", "subject": "Data Structures", "topic": "Binary Search Trees", "priority": "high"},
            {"time": "11:00 - 12:30", "subject": "DBMS", "topic": "Normalization 3NF & BCNF", "priority": "medium"},
            {"time": "14:00 - 15:30", "subject": "Operating Systems", "topic": "Deadlock Detection Algorithms", "priority": "high"}
        ]
    }

async def handle_create_study_plan(arguments: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    focus_subjects = arguments.get("focus_subjects", [])
    days = arguments.get("days", 7)
    return {
        "status": "success",
        "message": f"Generated AI optimized study plan for the next {days} days focusing on {', '.join(focus_subjects) if focus_subjects else 'all enrolled subjects'}.",
        "plan_id": "sp_generated_123"
    }

tool_registry.register(
    name="get_study_plan",
    description="Retrieves the student's study plan and scheduled study blocks for a given date or today.",
    parameters={
        "type": "object",
        "properties": {
            "date": {"type": "string", "description": "Date in YYYY-MM-DD format or 'today'"}
        },
        "required": []
    },
    handler=handle_get_study_plan
)

tool_registry.register(
    name="create_study_plan",
    description="Creates or regenerates an AI study plan based on exam schedule, weak topics, and study hours.",
    parameters={
        "type": "object",
        "properties": {
            "days": {"type": "integer", "description": "Number of days to plan for (default 7)"},
            "focus_subjects": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Optional list of subject names to prioritize"
            }
        },
        "required": []
    },
    handler=handle_create_study_plan
)
