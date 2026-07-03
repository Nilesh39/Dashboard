import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from .database import SessionLocal
from . import crud, simulation, models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def sync_job():
    """
    Background job that runs every 30 minutes.
    Performs simulation catch-up if active, writes a historical snapshot, and logs the outcome.
    """
    logger.info("Running background analytics sync and automation job...")
    db = SessionLocal()
    try:
        # Fetch the active profile account
        account = crud.get_or_create_account(db)
        account_id = account.id

        # First, run simulation catchup if active
        simulation.run_simulation_catchup(db, account_id)
        
        # Reload account after simulation updates
        db.refresh(account)

        # Create a new historical snapshot record
        history_record = models.AnalyticsHistory(
            instagram_account_id=account_id,
            followers=account.followers_count,
            following=account.following_count,
            posts=account.posts_count,
            reach=account.total_reach,
            engagement=account.total_engagement
        )
        db.add(history_record)
        db.commit()

        # Check if growth changes are notable (e.g., alert detection)
        # Compare with the previous record
        history_query = db.query(models.AnalyticsHistory)\
            .filter(models.AnalyticsHistory.instagram_account_id == account_id)\
            .order_by(models.AnalyticsHistory.timestamp.desc())\
            .offset(1)\
            .first()
            
        growth_message = ""
        if history_query:
            follower_diff = account.followers_count - history_query.followers
            if follower_diff > 0:
                growth_message = f" Growth alert: +{follower_diff} new followers detected since last snapshot."
                crud.add_automation_log(db, account_id, "ALERT", "SUCCESS", f"Notable growth detected!{growth_message}")

        # Add success sync log
        crud.add_automation_log(
            db, 
            account_id, 
            "SYNC", 
            "SUCCESS", 
            f"Analytics auto-sync completed. Snapshot recorded in history.{growth_message}"
        )
        logger.info("Background job completed successfully.")
        
    except Exception as e:
        logger.error(f"Error executing background job: {e}")
        # Log failure
        try:
            account = crud.get_or_create_account(db)
            crud.add_automation_log(
                db, 
                account.id, 
                "SYNC", 
                "FAILED", 
                f"Analytics auto-sync failed: {str(e)}"
            )
        except Exception:
            pass
    finally:
        db.close()

def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(
            sync_job,
            trigger=IntervalTrigger(minutes=30),
            id="instagram_sync_job",
            name="Sync analytics and simulate growth every 30 minutes",
            replace_existing=True
        )
        scheduler.start()
        logger.info("Background scheduler started successfully.")

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Background scheduler shut down.")
