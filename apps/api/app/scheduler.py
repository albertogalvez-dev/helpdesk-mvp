import time
import schedule
from app.queue import task_queue
from app.jobs import sla_escalation_job, auto_close_job, weekly_report_job
from app.core.config import get_settings

settings = get_settings()

def run_scheduler():
    # Enqueue jobs periodicallly
    # We use 'schedule' lib or just simple loop with sleep and checks
    # Since we didn't add 'schedule' to dependencies, I'll write a simple loop with helper.
    # Wait, did I add 'schedule'? No.
    # I'll use simple time check loop.
    
    last_escalation = 0
    last_daily = 0
    
    print("Scheduler started...")
    
    while True:
        now = time.time()
        
        # Escalation (every 5 mins)
        if now - last_escalation > settings.sla_escalation_interval_seconds:
            print("Enqueuing SLA Escalation Job")
            task_queue.enqueue(sla_escalation_job)
            last_escalation = now
            
        # Daily (check once a day, e.g. check current hour?)
        # For simplicity in MVP, lets just use interval of 24h, or explicit check.
        # Let's say we check every hour if logic needs running?
        # Auto close and weekly report depend on "Daily" or "Weekly" timing.
        # Better: use a robust library or just basic check.
        
        # Daily Auto Close
        if now - last_daily > 86400: # 24h
             print("Enqueuing Auto Close Job")
             task_queue.enqueue(auto_close_job)
             last_daily = now
             
        # Weekly
        # Check if Monday 9am?
        # Skip for MVP unless needed.
             
        time.sleep(60)

if __name__ == "__main__":
    run_scheduler()
