import json
import logging
import os
from typing import AsyncGenerator, Dict, Any, List
from groq import AsyncGroq, Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

CANDIDATE_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768"
]

class AIService:
    def get_async_client(self):
        api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
        if api_key:
            return AsyncGroq(api_key=api_key)
        return None

    def get_sync_client(self):
        api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
        if api_key:
            return Groq(api_key=api_key)
        return None

    def build_system_prompt(self, student_context: Dict[str, Any], language: str = "en") -> str:
        lang_instruction = "Respond in English."
        if language == "ta":
            lang_instruction = "Respond in Tamil."
        elif language == "tanglish":
            lang_instruction = "Respond naturally mixing Tamil and English as a college student in Tamil Nadu would speak."

        return f"""[ROLE]
You are Scholar, an AI study companion inside ScholarOS. Your job is to help students study effectively, manage their academic life, and improve learning outcomes.

[STUDENT CONTEXT]
{json.dumps(student_context, indent=2)}

[LANGUAGE]
{lang_instruction}

[RULES]
1. Always ground your answers in the student's actual enrolled subjects, attendance, and study schedule.
2. Never generate complete assignment or exam answers.
3. Be concise, encouraging, and actionable.
"""

    async def generate_response_stream(
        self,
        messages: List[Dict[str, Any]],
        student_context: Dict[str, Any],
        language: str = "en"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        system_instruction = self.build_system_prompt(student_context, language)

        client = self.get_async_client()
        if not client:
            yield {"type": "text", "content": "ScholarOS AI is running in mock mode. Add your GROQ_API_KEY to activate full intelligence."}
            return

        # Prepare OpenAI-compatible messages for Groq
        formatted_messages = [{"role": "system", "content": system_instruction}]
        for msg in messages:
            role = "user" if msg["role"] == "user" else "assistant"
            formatted_messages.append({"role": role, "content": msg["content"]})

        models_to_try = [settings.GROQ_MODEL] + [m for m in CANDIDATE_MODELS if m != settings.GROQ_MODEL]

        stream_started = False
        last_error = None

        for model in models_to_try:
            try:
                logger.info(f"Attempting Groq streaming with model: {model}")
                response_stream = await client.chat.completions.create(
                    model=model,
                    messages=formatted_messages,
                    stream=True,
                    temperature=0.7,
                    max_tokens=4096
                )

                async for chunk in response_stream:
                    if chunk.choices and chunk.choices[0].delta.content:
                        stream_started = True
                        yield {"type": "text", "content": chunk.choices[0].delta.content}

                if stream_started:
                    return
            except Exception as e:
                logger.warning(f"Model {model} failed in Groq AI service stream: {e}")
                last_error = e

        if not stream_started:
            logger.error(f"All candidate Groq models failed in AI service: {last_error}")
            yield {"type": "error", "content": f"AI service error: {last_error}"}

    async def generate_text_single(self, prompt: str) -> str:
        client = self.get_async_client()
        if not client:
            return ""

        models_to_try = [settings.GROQ_MODEL] + [m for m in CANDIDATE_MODELS if m != settings.GROQ_MODEL]
        for model in models_to_try:
            try:
                res = await client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}]
                )
                if res.choices and res.choices[0].message.content:
                    return res.choices[0].message.content.strip()
            except Exception as e:
                logger.warning(f"Model {model} failed in generate_text_single: {e}")
        return ""

ai_service = AIService()
