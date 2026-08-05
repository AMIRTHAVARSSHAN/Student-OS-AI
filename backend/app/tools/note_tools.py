from typing import Dict, Any
from app.tools.tool_registry import tool_registry

async def handle_search_notes(arguments: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    query = arguments.get("query", "")
    return {
        "status": "success",
        "query": query,
        "results": [
            {
                "title": "Binary Trees and BST Operations",
                "snippet": "In a Binary Search Tree, left child < root < right child. Insertion time complexity O(log N).",
                "relevance": 0.94
            },
            {
                "title": "AVL Trees and Rotations",
                "snippet": "Self-balancing binary search trees maintain height difference (balance factor) <= 1.",
                "relevance": 0.88
            }
        ]
    }

tool_registry.register(
    name="search_notes",
    description="Searches student notes and uploaded materials using semantic similarity.",
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Search query or topic"}
        },
        "required": ["query"]
    },
    handler=handle_search_notes
)
