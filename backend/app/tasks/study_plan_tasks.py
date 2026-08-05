from app.core.celery_app import celery_app
import logging

logger = logging.getLogger(__name__)

@celery_app.task
def generate_study_plan_task(user_id: str):
    logger.info(f"Executing study plan generation background task for user: {user_id}")
    return {"status": "completed", "user_id": user_id}
