from app.core.celery_app import celery_app
import logging

logger = logging.getLogger(__name__)

@celery_app.task
def send_notification_task(user_id: str, title: str, body: str):
    logger.info(f"Sending notification to user {user_id}: {title} - {body}")
    return {"status": "sent", "user_id": user_id}
