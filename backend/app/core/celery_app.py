from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "scholar_os",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.study_plan_tasks",
        "app.tasks.notification_tasks",
        "app.tasks.analytics_tasks",
    ]
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Kolkata",
    task_track_started=True,
    task_time_limit=300,
    task_soft_time_limit=240,
    worker_prefetch_multiplier=1,
)
