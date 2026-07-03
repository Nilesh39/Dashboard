import datetime
import random
from sqlalchemy.orm import Session
from . import models, crud

def run_simulation_catchup(db: Session, account_id: int) -> bool:
    """
    Checks if live simulation is active, calculates the time elapsed since the last run,
    and applies proportional metrics growth (followers, views, likes, comments, etc.).
    Returns True if growth was applied, False otherwise.
    """
    settings = crud.get_automation_settings(db, account_id)
    if not settings or not settings.simulation_active:
        return False

    now = datetime.datetime.utcnow()
    last_run = settings.last_simulation_run or now
    elapsed_seconds = (now - last_run).total_seconds()
    
    # Run simulation only if at least 5 seconds have elapsed to avoid high write lockups
    if elapsed_seconds < 5:
        return False
    
    # Calculate daily growth rate from settings
    growth_rate_followers = settings.growth_rate_followers_per_day
    
    # Convert growth rate per day to growth rate per second
    followers_increment_float = (growth_rate_followers / 86400.0) * elapsed_seconds
    
    # If the fractional increment is very small, we might not get any growth.
    # To make it look "live" even on fast refreshes, if elapsed_seconds is > 5
    # and the calculated follower growth is 0, we can randomly add 0 or 1 follower,
    # or just accumulate it. Let's do a deterministic accumulation or add a small probability.
    followers_to_add = int(followers_increment_float)
    
    # If followers_increment_float is less than 1, we use probability to decide if we add 1
    if followers_to_add == 0 and followers_increment_float > 0:
        if random.random() < followers_increment_float:
            followers_to_add = 1

    # Update last run timestamp
    settings.last_simulation_run = now
    db.commit()

    if followers_to_add <= 0:
        return False

    # Retrieve account to apply updates
    account = db.query(models.InstagramAccount).filter(models.InstagramAccount.id == account_id).first()
    if not account:
        return False

    # Apply growth to account
    account.followers_count += followers_to_add
    
    # Correlated metrics growth
    # For every follower, we simulate a realistic range of views, likes, and reach
    views_multiplier = random.uniform(15.0, 35.0)
    likes_multiplier = random.uniform(1.2, 2.8)
    comments_multiplier = random.uniform(0.05, 0.15)
    shares_multiplier = random.uniform(0.1, 0.3)
    saves_multiplier = random.uniform(0.2, 0.5)

    views_to_add = int(followers_to_add * views_multiplier)
    likes_to_add = int(followers_to_add * likes_multiplier)
    comments_to_add = int(followers_to_add * comments_multiplier)
    shares_to_add = int(followers_to_add * shares_multiplier)
    saves_to_add = int(followers_to_add * saves_multiplier)
    
    reach_to_add = int(views_to_add * random.uniform(1.1, 1.3))
    engagement_to_add = likes_to_add + comments_to_add + shares_to_add + saves_to_add

    account.total_reach += reach_to_add
    account.total_engagement += engagement_to_add

    # Distribute the growth across existing reels
    reels = db.query(models.Reel).filter(models.Reel.instagram_account_id == account_id).all()
    if reels:
        # Give more weight to the most recent reels
        weights = [len(reels) - i for i in range(len(reels))]
        total_weight = sum(weights)
        
        # Normalize weights
        probs = [w / total_weight for w in weights]
        
        for i, reel in enumerate(reels):
            # Proportional share of the growth
            share = probs[i]
            r_views = int(views_to_add * share)
            r_likes = int(likes_to_add * share)
            r_comments = int(comments_to_add * share)
            r_shares = int(shares_to_add * share)
            r_saves = int(saves_to_add * share)
            
            reel.views += r_views
            reel.likes += r_likes
            reel.comments += r_comments
            reel.shares += r_shares
            reel.saves += r_saves
            reel.reach += int(r_views * random.uniform(1.1, 1.3))
            reel.watch_time_hours += round(r_views * 0.005, 1)
            
            # Recalculate engagement rate
            r_eng = reel.likes + reel.comments + reel.shares + reel.saves
            reel.engagement_rate = round((r_eng / reel.views) * 100, 2) if reel.views > 0 else 0.0

    # Write simulation log
    message = (f"Simulation Tick: Added +{followers_to_add} followers, +{views_to_add} views, "
               f"+{likes_to_add} likes, +{comments_to_add} comments, +{shares_to_add} shares, "
               f"+{saves_to_add} saves across reels.")
    
    crud.add_automation_log(db, account_id, "SIMULATION", "SUCCESS", message)
    
    db.commit()
    return True
