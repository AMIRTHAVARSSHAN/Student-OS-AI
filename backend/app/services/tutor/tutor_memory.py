import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

# Fallback in-memory session chat cache
_IN_MEMORY_SESSION_CACHE: Dict[str, List[Dict[str, str]]] = {}

class TutorMemoryStore:
    def __init__(self):
        self.upstash_url = settings.UPSTASH_REDIS_REST_URL
        self.upstash_token = settings.UPSTASH_REDIS_REST_TOKEN

    async def _upstash_command(self, cmd: List[str]) -> Optional[Any]:
        if not self.upstash_url or not self.upstash_token:
            return None
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(
                    self.upstash_url,
                    headers={"Authorization": f"Bearer {self.upstash_token}"},
                    json=cmd
                )
                if res.status_code == 200:
                    data = res.json()
                    return data.get("result")
        except Exception as e:
            logger.warning(f"Upstash Redis REST notice: {e}")
        return None

    async def get_session_history(self, session_id: str, limit: int = 10) -> List[Dict[str, str]]:
        if not session_id:
            return []

        # 1. Try Upstash Redis REST
        redis_key = f"tutor:session:{session_id}:history"
        raw_list = await self._upstash_command(["LRANGE", redis_key, "0", str(limit - 1)])

        if raw_list and isinstance(raw_list, list):
            history = []
            for item in raw_list:
                try:
                    history.append(json.loads(item))
                except Exception:
                    pass
            if history:
                return history

        # 2. Fallback to In-Memory Cache
        return _IN_MEMORY_SESSION_CACHE.get(session_id, [])[-limit:]

    async def append_session_message(self, session_id: str, role: str, content: str):
        if not session_id or not content.strip():
            return

        msg_obj = {"role": role, "content": content}
        msg_str = json.dumps(msg_obj)

        # 1. Store in Upstash Redis REST
        redis_key = f"tutor:session:{session_id}:history"
        await self._upstash_command(["RPUSH", redis_key, msg_str])
        # Keep latest 30 messages
        await self._upstash_command(["LTRIM", redis_key, "-30", "-1"])

        # 2. Update In-Memory Cache
        if session_id not in _IN_MEMORY_SESSION_CACHE:
            _IN_MEMORY_SESSION_CACHE[session_id] = []
        _IN_MEMORY_SESSION_CACHE[session_id].append(msg_obj)
        if len(_IN_MEMORY_SESSION_CACHE[session_id]) > 30:
            _IN_MEMORY_SESSION_CACHE[session_id] = _IN_MEMORY_SESSION_CACHE[session_id][-30:]

tutor_memory_store = TutorMemoryStore()
