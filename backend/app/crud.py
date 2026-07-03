import datetime
import random
from sqlalchemy.orm import Session
from sqlalchemy import desc
from . import models, schemas
from .schemas import parse_string_metric

DEFAULT_USERNAME = "pixels_and_code"

# Default theme settings
DEFAULT_THEME = {
    "backgroundColor": "#000000",
    "primaryColor": "#E1306C",
    "secondaryColor": "#F56040",
    "accentColor": "#FCAF45",
    "purpleColor": "#833AB4",
    "blueColor": "#405DE6",
    "textColor": "#FFFFFF",
    "cardStyle": "glassmorphism", # glassmorphism, neon, border, solid
    "fontFamily": "Inter", # Inter, Roboto, Outfit, Poppins
}

def get_or_create_account(db: Session, username: str = DEFAULT_USERNAME) -> models.InstagramAccount:
    account = db.query(models.InstagramAccount).filter(models.InstagramAccount.username == username).first()
    if not account:
        # Create default profile
        account = models.InstagramAccount(
            username=username,
            full_name="Elena Rostova | Tech & Travel",
            bio="💻 Software Engineer & Travel Creator\n📍 Based in San Francisco\n💌 Collabs: contact@elenarostova.dev\n✨ Building the future of SaaS, one pixel at a time.",
            profile_pic_url="/avatar.jpg", # Vite public asset path
            followers_count=128500,
            following_count=482,
            posts_count=142,
            reels_count=8,
            total_reach=850000,
            total_engagement=58400,
            theme_settings=DEFAULT_THEME
        )
        db.add(account)
        db.commit()
        db.refresh(account)

        # Create default audience insights
        audience = models.AudienceInsights(
            instagram_account_id=account.id,
            male_percentage=42.5,
            female_percentage=57.5,
            age_distribution={"13-17": 4.2, "18-24": 38.6, "25-34": 42.1, "35-44": 11.3, "45+": 3.8},
            country_distribution={"USA": 35.0, "India": 22.0, "Brazil": 12.0, "UK": 8.0, "Germany": 7.0, "Canada": 6.0, "Others": 10.0},
            followers_vs_non_followers={"followers": 65.0, "non_followers": 35.0}
        )
        db.add(audience)

        # Create default automation settings
        auto_settings = models.AutomationSettings(
            instagram_account_id=account.id,
            simulation_active=True,
            growth_rate_followers_per_day=500,
            last_simulation_run=datetime.datetime.utcnow()
        )
        db.add(auto_settings)

        # Create initial history (last 30 days)
        generate_history_for_tier(db, account.id, 128500, 30)

        # Create default reels
        create_default_reels(db, account.id)

        # Add initial log
        log = models.AutomationLog(
            instagram_account_id=account.id,
            event_type="INFO",
            status="SUCCESS",
            message="Database initialized with default credentials and profile."
        )
        db.add(log)

        db.commit()
        db.refresh(account)
    return account

def update_account(db: Session, account_id: int, updates: schemas.InstagramAccountUpdate) -> models.InstagramAccount:
    account = db.query(models.InstagramAccount).filter(models.InstagramAccount.id == account_id).first()
    if not account:
        return None
    
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key in ["followers_count", "following_count", "posts_count", "reels_count", "total_reach", "total_engagement"]:
            setattr(account, key, parse_string_metric(value))
        else:
            setattr(account, key, value)
    
    db.commit()
    db.refresh(account)
    return account

def create_default_reels(db: Session, account_id: int):
    # delete any existing reels
    db.query(models.Reel).filter(models.Reel.instagram_account_id == account_id).delete()

    reels_data = [
        {"title": "Day in the life of a remote software engineer", "views": 250000, "likes": 21000, "comments": 850, "shares": 3400, "saves": 5800, "watch_time_hours": 1250.5, "days_ago": 2},
        {"title": "5 VS Code shortcuts you aren't using!", "views": 480000, "likes": 39500, "comments": 1420, "shares": 9200, "saves": 18200, "watch_time_hours": 2400.0, "days_ago": 5},
        {"title": "Solo traveling in Kyoto, Japan: Travel Guide 🇯🇵", "views": 185000, "likes": 16200, "comments": 612, "shares": 1200, "saves": 3100, "watch_time_hours": 925.2, "days_ago": 9},
        {"title": "How I organize my life with Notion", "views": 98000, "likes": 8100, "comments": 240, "shares": 450, "saves": 1800, "watch_time_hours": 490.0, "days_ago": 14},
        {"title": "Vercel vs Netlify: Which is better in 2026?", "views": 155000, "likes": 11800, "comments": 590, "shares": 2200, "saves": 4100, "watch_time_hours": 775.0, "days_ago": 18},
        {"title": "Aesthetic coffee shops in San Francisco ☕", "views": 82000, "likes": 6900, "comments": 188, "shares": 890, "saves": 1200, "watch_time_hours": 410.0, "days_ago": 23},
        {"title": "React Server Components explained in 60s", "views": 320000, "likes": 28400, "comments": 940, "shares": 6800, "saves": 11200, "watch_time_hours": 1600.0, "days_ago": 26},
        {"title": "Packing my tech bag for a 1-month trip 🎒", "views": 112000, "likes": 9800, "comments": 310, "shares": 720, "saves": 1500, "watch_time_hours": 560.0, "days_ago": 29}
    ]

    for item in reels_data:
        views = item["views"]
        likes = item["likes"]
        comments = item["comments"]
        shares = item["shares"]
        saves = item["saves"]
        reach = int(views * random.uniform(1.1, 1.4))
        engagement = likes + comments + shares + saves
        er = round((engagement / views) * 100, 2) if views > 0 else 0.0

        reel = models.Reel(
            instagram_account_id=account_id,
            title=item["title"],
            views=views,
            likes=likes,
            comments=comments,
            shares=shares,
            saves=saves,
            reach=reach,
            watch_time_hours=item["watch_time_hours"],
            engagement_rate=er,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=item["days_ago"])
        )
        db.add(reel)

def generate_history_for_tier(db: Session, account_id: int, current_followers: int, days: int = 30):
    # clear existing history
    db.query(models.AnalyticsHistory).filter(models.AnalyticsHistory.instagram_account_id == account_id).delete()

    follower_val = current_followers
    reach_val = int(follower_val * 6.5)
    engagement_val = int(follower_val * 0.45)

    history_entries = []
    for i in range(days - 1, -1, -1):
        timestamp = datetime.datetime.utcnow() - datetime.timedelta(days=i)
        # Random daily changes
        daily_follower_growth = int(current_followers * 0.003 * random.uniform(0.5, 1.5))
        # Ensure we subtract going backward
        follower_val = max(10, follower_val - daily_follower_growth if i > 0 else follower_val)
        
        reach_val = int(follower_val * random.uniform(5.5, 7.5))
        engagement_val = int(follower_val * random.uniform(0.35, 0.55))

        hist = models.AnalyticsHistory(
            instagram_account_id=account_id,
            followers=follower_val,
            following=400 + random.randint(1, 100),
            posts=120 + (30 - i) // 3,
            reach=reach_val,
            engagement=engagement_val,
            timestamp=timestamp
        )
        history_entries.append(hist)
    
    # reverse back to chronological order (earliest first)
    history_entries.reverse()
    
    # Set final entry equal to current values
    history_entries[-1].followers = current_followers
    
    for hist in history_entries:
        db.add(hist)

def get_reels(db: Session, account_id: int):
    return db.query(models.Reel).filter(models.Reel.instagram_account_id == account_id).order_by(desc(models.Reel.created_at)).all()

def create_reel(db: Session, account_id: int, reel_in: schemas.ReelCreate) -> models.Reel:
    views = parse_string_metric(reel_in.views)
    likes = parse_string_metric(reel_in.likes)
    comments = parse_string_metric(reel_in.comments)
    shares = parse_string_metric(reel_in.shares)
    saves = parse_string_metric(reel_in.saves)
    
    reach = parse_string_metric(reel_in.reach)
    if reach == 0:
        reach = int(views * random.uniform(1.1, 1.4))

    engagement = likes + comments + shares + saves
    er = round((engagement / views) * 100, 2) if views > 0 else 0.0

    reel = models.Reel(
        instagram_account_id=account_id,
        title=reel_in.title,
        media_url=reel_in.media_url,
        thumbnail_url=reel_in.thumbnail_url,
        views=views,
        likes=likes,
        comments=comments,
        shares=shares,
        saves=saves,
        reach=reach,
        watch_time_hours=reel_in.watch_time_hours,
        engagement_rate=er,
        created_at=datetime.datetime.utcnow()
    )
    db.add(reel)
    db.commit()
    db.refresh(reel)
    
    # Update reels count
    account = db.query(models.InstagramAccount).filter(models.InstagramAccount.id == account_id).first()
    if account:
        account.reels_count = db.query(models.Reel).filter(models.Reel.instagram_account_id == account_id).count()
        db.commit()

    return reel

def update_reel(db: Session, reel_id: int, updates: schemas.ReelUpdate) -> models.Reel:
    reel = db.query(models.Reel).filter(models.Reel.id == reel_id).first()
    if not reel:
        return None
    
    update_data = updates.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if key in ["views", "likes", "comments", "shares", "saves", "reach"]:
            setattr(reel, key, parse_string_metric(value))
        else:
            setattr(reel, key, value)
    
    # Recompute Engagement Rate
    engagement = reel.likes + reel.comments + reel.shares + reel.saves
    reel.engagement_rate = round((engagement / reel.views) * 100, 2) if reel.views > 0 else 0.0
    
    db.commit()
    db.refresh(reel)
    return reel

def delete_reel(db: Session, reel_id: int, account_id: int) -> bool:
    reel = db.query(models.Reel).filter(models.Reel.id == reel_id).first()
    if not reel:
        return False
    db.delete(reel)
    db.commit()

    # Update reels count
    account = db.query(models.InstagramAccount).filter(models.InstagramAccount.id == account_id).first()
    if account:
        account.reels_count = db.query(models.Reel).filter(models.Reel.instagram_account_id == account_id).count()
        db.commit()

    return True

def duplicate_reel(db: Session, reel_id: int) -> models.Reel:
    original = db.query(models.Reel).filter(models.Reel.id == reel_id).first()
    if not original:
        return None
    
    duplicate = models.Reel(
        instagram_account_id=original.instagram_account_id,
        title=f"{original.title} (Copy)",
        media_url=original.media_url,
        thumbnail_url=original.thumbnail_url,
        views=original.views,
        likes=original.likes,
        comments=original.comments,
        shares=original.shares,
        saves=original.saves,
        reach=original.reach,
        watch_time_hours=original.watch_time_hours,
        engagement_rate=original.engagement_rate,
        created_at=datetime.datetime.utcnow()
    )
    db.add(duplicate)
    db.commit()
    db.refresh(duplicate)

    # Update reels count
    account = db.query(models.InstagramAccount).filter(models.InstagramAccount.id == original.instagram_account_id).first()
    if account:
        account.reels_count = db.query(models.Reel).filter(models.Reel.instagram_account_id == original.instagram_account_id).count()
        db.commit()

    return duplicate

def bulk_update_reels(db: Session, account_id: int, updates: schemas.ReelBulkUpdate) -> bool:
    for entry in updates.reels:
        reel_id = entry.get("id")
        if not reel_id:
            continue
        reel = db.query(models.Reel).filter(models.Reel.id == reel_id, models.Reel.instagram_account_id == account_id).first()
        if not reel:
            continue
        for key, value in entry.items():
            if key == "id":
                continue
            if key in ["views", "likes", "comments", "shares", "saves", "reach"]:
                setattr(reel, key, parse_string_metric(value))
            else:
                setattr(reel, key, value)
        
        # Recompute engagement rate
        engagement = reel.likes + reel.comments + reel.shares + reel.saves
        reel.engagement_rate = round((engagement / reel.views) * 100, 2) if reel.views > 0 else 0.0
    
    db.commit()
    return True

def get_analytics_history(db: Session, account_id: int, limit: int = 30):
    return db.query(models.AnalyticsHistory).filter(models.AnalyticsHistory.instagram_account_id == account_id).order_by(models.AnalyticsHistory.timestamp).all()

def add_analytics_history_record(db: Session, account_id: int, record: schemas.AnalyticsHistoryCreate) -> models.AnalyticsHistory:
    new_record = models.AnalyticsHistory(
        instagram_account_id=account_id,
        followers=parse_string_metric(record.followers),
        following=parse_string_metric(record.following),
        posts=parse_string_metric(record.posts),
        reach=parse_string_metric(record.reach),
        engagement=parse_string_metric(record.engagement),
        timestamp=record.timestamp
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

def delete_analytics_history_record(db: Session, history_id: int, account_id: int) -> bool:
    record = db.query(models.AnalyticsHistory).filter(models.AnalyticsHistory.id == history_id, models.AnalyticsHistory.instagram_account_id == account_id).first()
    if not record:
        return False
    db.delete(record)
    db.commit()
    return True

def get_audience_insights(db: Session, account_id: int) -> models.AudienceInsights:
    return db.query(models.AudienceInsights).filter(models.AudienceInsights.instagram_account_id == account_id).first()

def update_audience_insights(db: Session, account_id: int, updates: schemas.AudienceInsightsUpdate) -> models.AudienceInsights:
    audience = db.query(models.AudienceInsights).filter(models.AudienceInsights.instagram_account_id == account_id).first()
    if not audience:
        return None
    
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(audience, key, value)
    
    db.commit()
    db.refresh(audience)
    return audience

def get_automation_settings(db: Session, account_id: int) -> models.AutomationSettings:
    settings = db.query(models.AutomationSettings).filter(models.AutomationSettings.instagram_account_id == account_id).first()
    if not settings:
        settings = models.AutomationSettings(
            instagram_account_id=account_id,
            simulation_active=False,
            growth_rate_followers_per_day=100
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def update_automation_settings(db: Session, account_id: int, updates: schemas.AutomationSettingsUpdate) -> models.AutomationSettings:
    settings = get_automation_settings(db, account_id)
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings

def get_automation_logs(db: Session, account_id: int, limit: int = 100):
    return db.query(models.AutomationLog).filter(models.AutomationLog.instagram_account_id == account_id).order_by(desc(models.AutomationLog.timestamp)).limit(limit).all()

def add_automation_log(db: Session, account_id: int, event_type: str, status: str, message: str) -> models.AutomationLog:
    log = models.AutomationLog(
        instagram_account_id=account_id,
        event_type=event_type,
        status=status,
        message=message
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def clear_logs(db: Session, account_id: int) -> bool:
    db.query(models.AutomationLog).filter(models.AutomationLog.instagram_account_id == account_id).delete()
    db.commit()
    return True

# Demo Data Generation Logic
def generate_demo_data_for_tier(db: Session, account_id: int, tier: str) -> models.InstagramAccount:
    account = db.query(models.InstagramAccount).filter(models.InstagramAccount.id == account_id).first()
    if not account:
        return None
    
    # Follower tiers map
    tiers = {
        "1K": {"followers": 1200, "following": 350, "reach": 8500, "engagement": 980, "reels_views": 1500},
        "10K": {"followers": 10500, "following": 510, "reach": 74000, "engagement": 6500, "reels_views": 12000},
        "100K": {"followers": 105000, "following": 420, "reach": 780000, "engagement": 59000, "reels_views": 95000},
        "1M": {"followers": 1250000, "following": 180, "reach": 8400000, "engagement": 620000, "reels_views": 850000},
        "10M": {"followers": 10200000, "following": 95, "reach": 68000000, "engagement": 4900000, "reels_views": 6200000}
    }

    tier_info = tiers.get(tier, tiers["100K"])
    followers = tier_info["followers"]
    
    # Scale profile metrics
    account.followers_count = followers
    account.following_count = tier_info["following"]
    account.total_reach = tier_info["reach"]
    account.total_engagement = tier_info["engagement"]
    
    # Update reels count to 8
    account.reels_count = 8
    
    # Scale Reels metrics
    db.query(models.Reel).filter(models.Reel.instagram_account_id == account_id).delete()
    
    reels_templates = [
        {"title": "Day in the life of a remote software engineer", "views_factor": 2.1, "likes_pct": 0.084, "comments_pct": 0.0034, "shares_pct": 0.013, "saves_pct": 0.023, "wt_factor": 0.005, "days_ago": 2},
        {"title": "5 VS Code shortcuts you aren't using!", "views_factor": 4.5, "likes_pct": 0.082, "comments_pct": 0.003, "shares_pct": 0.019, "saves_pct": 0.038, "wt_factor": 0.005, "days_ago": 5},
        {"title": "Solo traveling in Kyoto, Japan: Travel Guide 🇯🇵", "views_factor": 1.6, "likes_pct": 0.087, "comments_pct": 0.0033, "shares_pct": 0.006, "saves_pct": 0.017, "wt_factor": 0.005, "days_ago": 9},
        {"title": "How I organize my life with Notion", "views_factor": 0.9, "likes_pct": 0.083, "comments_pct": 0.0024, "shares_pct": 0.004, "saves_pct": 0.018, "wt_factor": 0.005, "days_ago": 14},
        {"title": "Vercel vs Netlify: Which is better in 2026?", "views_factor": 1.4, "likes_pct": 0.076, "comments_pct": 0.0038, "shares_pct": 0.014, "saves_pct": 0.026, "wt_factor": 0.005, "days_ago": 18},
        {"title": "Aesthetic coffee shops in San Francisco ☕", "views_factor": 0.75, "likes_pct": 0.084, "comments_pct": 0.0023, "shares_pct": 0.011, "saves_pct": 0.015, "wt_factor": 0.005, "days_ago": 23},
        {"title": "React Server Components explained in 60s", "views_factor": 3.0, "likes_pct": 0.088, "comments_pct": 0.0029, "shares_pct": 0.021, "saves_pct": 0.035, "wt_factor": 0.005, "days_ago": 26},
        {"title": "Packing my tech bag for a 1-month trip 🎒", "views_factor": 1.05, "likes_pct": 0.087, "comments_pct": 0.0028, "shares_pct": 0.006, "saves_pct": 0.013, "wt_factor": 0.005, "days_ago": 29}
    ]

    base_views = tier_info["reels_views"]

    for tmpl in reels_templates:
        views = int(base_views * tmpl["views_factor"] * random.uniform(0.9, 1.1))
        likes = int(views * tmpl["likes_pct"] * random.uniform(0.9, 1.1))
        comments = int(likes * tmpl["comments_pct"] / tmpl["likes_pct"] * random.uniform(0.8, 1.2))
        shares = int(views * tmpl["shares_pct"] * random.uniform(0.9, 1.1))
        saves = int(views * tmpl["saves_pct"] * random.uniform(0.9, 1.1))
        
        reach = int(views * random.uniform(1.1, 1.35))
        watch_time = round(views * tmpl["wt_factor"] * random.uniform(0.9, 1.1), 1)
        
        engagement = likes + comments + shares + saves
        er = round((engagement / views) * 100, 2) if views > 0 else 0.0

        reel = models.Reel(
            instagram_account_id=account_id,
            title=tmpl["title"],
            views=views,
            likes=likes,
            comments=comments,
            shares=shares,
            saves=saves,
            reach=reach,
            watch_time_hours=watch_time,
            engagement_rate=er,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=tmpl["days_ago"])
        )
        db.add(reel)

    # Scale Audience demographics slightly differently based on tier to add realism
    audience = db.query(models.AudienceInsights).filter(models.AudienceInsights.instagram_account_id == account_id).first()
    if audience:
        if tier in ["1K", "10K"]:
            audience.male_percentage = 48.0
            audience.female_percentage = 52.0
            audience.age_distribution = {"13-17": 8.0, "18-24": 42.0, "25-34": 35.0, "35-44": 10.0, "45+": 5.0}
            audience.country_distribution = {"India": 42.0, "USA": 20.0, "Brazil": 10.0, "Canada": 5.0, "Others": 23.0}
        elif tier == "100K":
            audience.male_percentage = 42.5
            audience.female_percentage = 57.5
            audience.age_distribution = {"13-17": 4.2, "18-24": 38.6, "25-34": 42.1, "35-44": 11.3, "45+": 3.8}
            audience.country_distribution = {"USA": 35.0, "India": 22.0, "Brazil": 12.0, "UK": 8.0, "Canada": 6.0, "Others": 17.0}
        else: # 1M, 10M
            audience.male_percentage = 45.0
            audience.female_percentage = 55.0
            audience.age_distribution = {"13-17": 5.0, "18-24": 30.0, "25-34": 40.0, "35-44": 18.0, "45+": 7.0}
            audience.country_distribution = {"USA": 28.0, "Brazil": 18.0, "India": 15.0, "UK": 7.0, "Germany": 6.0, "Indonesia": 6.0, "Others": 20.0}

    # Scale History
    generate_history_for_tier(db, account_id, followers, 30)

    # Log action
    log = models.AutomationLog(
        instagram_account_id=account_id,
        event_type="SYNC",
        status="SUCCESS",
        message=f"Generated demo data for {tier} followers tier."
    )
    db.add(log)

    db.commit()
    db.refresh(account)
    return account

def reset_database(db: Session, account_id: int) -> models.InstagramAccount:
    # Delete everything related to this account
    db.query(models.Reel).filter(models.Reel.instagram_account_id == account_id).delete()
    db.query(models.AnalyticsHistory).filter(models.AnalyticsHistory.instagram_account_id == account_id).delete()
    db.query(models.AudienceInsights).filter(models.AudienceInsights.instagram_account_id == account_id).delete()
    db.query(models.AutomationSettings).filter(models.AutomationSettings.instagram_account_id == account_id).delete()
    db.query(models.AutomationLog).filter(models.AutomationLog.instagram_account_id == account_id).delete()
    db.query(models.InstagramAccount).filter(models.InstagramAccount.id == account_id).delete()
    db.commit()

    # Re-create defaults
    return get_or_create_account(db)
