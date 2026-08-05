from typing import Dict, Any, Callable, List
import logging

logger = logging.getLogger(__name__)

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Dict[str, Any]] = {}
        self._handlers: Dict[str, Callable] = {}

    def register(self, name: str, description: str, parameters: dict, handler: Callable):
        self._tools[name] = {
            "name": name,
            "description": description,
            "parameters": parameters
        }
        self._handlers[name] = handler
        logger.info(f"Registered AI Tool: {name}")

    def get_all_declarations(self) -> List[Dict[str, Any]]:
        return list(self._tools.values())

    async def execute(self, name: str, arguments: Dict[str, Any], context: Dict[str, Any]) -> Any:
        if name not in self._handlers:
            raise ValueError(f"Tool '{name}' is not registered.")
        handler = self._handlers[name]
        return await handler(arguments=arguments, context=context)

tool_registry = ToolRegistry()
