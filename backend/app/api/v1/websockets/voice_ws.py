from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import logging
from app.services.voice_service import voice_service
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.websocket("/stream")
async def voice_websocket_stream(websocket: WebSocket):
    await websocket.accept()
    logger.info("Voice WebSocket connection established")

    try:
        while True:
            # Receive audio chunk or json metadata from client
            message = await websocket.receive()
            if "text" in message:
                data = json.loads(message["text"])
                if data.get("action") == "ping":
                    await websocket.send_json({"type": "pong"})
            elif "bytes" in message:
                audio_bytes = message["bytes"]
                # 1. STT Transcribe
                transcript = await voice_service.transcribe_audio_stream(audio_bytes, language="tanglish")
                await websocket.send_json({"type": "transcript", "text": transcript})

                # 2. Get AI Response
                context = {"user_name": "Student"}
                ai_response_text = ""
                async for chunk in ai_service.generate_response_stream(
                    messages=[{"role": "user", "content": transcript}],
                    student_context=context,
                    language="tanglish"
                ):
                    if chunk["type"] == "text":
                        ai_response_text += chunk["content"]
                        await websocket.send_json({"type": "ai_text", "content": chunk["content"]})

                # 3. TTS Stream back
                async for audio_chunk in voice_service.generate_speech_stream(ai_response_text, language="tanglish"):
                    await websocket.send_bytes(audio_chunk)

    except WebSocketDisconnect:
        logger.info("Voice WebSocket disconnected")
    except Exception as e:
        logger.error(f"Voice WebSocket error: {str(e)}")
        await websocket.close()
