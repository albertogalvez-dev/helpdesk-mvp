import os
import redis
from rq import Queue
from app.core.config import get_settings

settings = get_settings()

redis_conn = redis.from_url(settings.redis_url)
task_queue = Queue("default", connection=redis_conn)
