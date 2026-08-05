import json
import logging
import os
from typing import AsyncGenerator, Dict, Any, List
from google import genai
from google.genai import types
from app.core.config import settings

logger = logging.getLogger(__name__)

CANDIDATE_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-2.0-flash"
]

class AIService:
    def get_client(self):
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        if api_key:
            return genai.Client(api_key=api_key)
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

        client = self.get_client()
        if not client:
            yield {"type": "text", "content": "ScholarOS AI is running in mock mode. Add your GEMINI_API_KEY to activate full intelligence."}
            return

        # Prepare Gemini contents
        formatted_contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            formatted_contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=msg["content"])]
                )
            )

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
            top_p=0.95,
            max_output_tokens=4096,
        )

        stream_started = False
        last_error = None

        # Build candidate model list with user configured model first
        models_to_try = [settings.GEMINI_MODEL] + [m for m in CANDIDATE_MODELS if m != settings.GEMINI_MODEL]

        for model in models_to_try:
            try:
                logger.info(f"Attempting Gemini streaming with model: {model}")
                response_stream = client.models.generate_content_stream(
                    model=model,
                    contents=formatted_contents,
                    config=config,
                )

                for chunk in response_stream:
                    if chunk.text:
                        stream_started = True
                        yield {"type": "text", "content": chunk.text}

                if stream_started:
                    return
            except Exception as e:
                logger.warning(f"Model {model} failed in AI service stream: {e}")
                last_error = e

        if not stream_started:
            logger.error(f"All candidate models failed in AI service: {last_error}")
            yield {"type": "error", "content": f"AI service rate limited or quota exceeded. Please try again shortly."}

    async def generate_text_single(self, prompt: str) -> str:
        client = self.get_client()
        if not client:
            return ""

        models_to_try = [settings.GEMINI_MODEL] + [m for m in CANDIDATE_MODELS if m != settings.GEMINI_MODEL]
        for model in models_to_try:
            try:
                res = client.models.generate_content(
                    model=model,
                    contents=prompt
                )
                if res.text:
                    return res.text.strip()
            except Exception as e:
                logger.warning(f"Model {model} failed in generate_text_single: {e}")
        return ""

ai_service = AIService()
