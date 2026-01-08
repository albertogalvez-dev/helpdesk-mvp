import os
import redis
from rq import Worker, Queue, Connection
from app.core.config import get_settings

settings = get_settings()
listen = ['default']

def run_worker():
    redis_url = settings.redis_url
    conn = redis.from_url(redis_url)
    with Connection(conn):
        worker = Worker(list(map(Queue, listen)))
        worker.work()

if __name__ == '__main__':
    run_worker()
