import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from .database import Base

class InstagramAccount(Base):
    __tablename__ = "instagram_accounts"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, default="")
    bio = Column(Text, default="")
    profile_pic_url = Column(String, default="")
    followers_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    posts_count = Column(Integer, default=0)
    reels_count = Column(Integer, default=0)
    total_reach = Column(Integer, default=0)
    total_engagement = Column(Integer, default=0)
    theme_settings = Column(JSON, default=dict)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    reels = relationship("Reel", back_populates="account", cascade="all, delete-orphan")
    analytics_history = relationship("AnalyticsHistory", back_populates="account", cascade="all, delete-orphan")
    audience_insights = relationship("AudienceInsights", back_populates="account", uselist=False, cascade="all, delete-orphan")
    automation_settings = relationship("AutomationSettings", back_populates="account", uselist=False, cascade="all, delete-orphan")
    automation_logs = relationship("AutomationLog", back_populates="account", cascade="all, delete-orphan")

class Reel(Base):
    __tablename__ = "reels"

    id = Column(Integer, primary_key=True, index=True)
    instagram_account_id = Column(Integer, ForeignKey("instagram_accounts.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, default="")
    media_url = Column(String, default="")
    thumbnail_url = Column(String, default="")
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    reach = Column(Integer, default=0)
    watch_time_hours = Column(Float, default=0.0)
    engagement_rate = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    account = relationship("InstagramAccount", back_populates="reels")

class AnalyticsHistory(Base):
    __tablename__ = "analytics_history"

    id = Column(Integer, primary_key=True, index=True)
    instagram_account_id = Column(Integer, ForeignKey("instagram_accounts.id", ondelete="CASCADE"), nullable=False)
    followers = Column(Integer, default=0)
    following = Column(Integer, default=0)
    posts = Column(Integer, default=0)
    reach = Column(Integer, default=0)
    engagement = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    account = relationship("InstagramAccount", back_populates="analytics_history")

class AudienceInsights(Base):
    __tablename__ = "audience_insights"

    id = Column(Integer, primary_key=True, index=True)
    instagram_account_id = Column(Integer, ForeignKey("instagram_accounts.id", ondelete="CASCADE"), unique=True, nullable=False)
    male_percentage = Column(Float, default=50.0)
    female_percentage = Column(Float, default=50.0)
    age_distribution = Column(JSON, default=dict)
    country_distribution = Column(JSON, default=dict)
    followers_vs_non_followers = Column(JSON, default=dict)

    account = relationship("InstagramAccount", back_populates="audience_insights")

class AutomationSettings(Base):
    __tablename__ = "automation_settings"

    id = Column(Integer, primary_key=True, index=True)
    instagram_account_id = Column(Integer, ForeignKey("instagram_accounts.id", ondelete="CASCADE"), unique=True, nullable=False)
    simulation_active = Column(Boolean, default=False)
    growth_rate_followers_per_day = Column(Integer, default=100)
    last_simulation_run = Column(DateTime, default=datetime.datetime.utcnow)

    account = relationship("InstagramAccount", back_populates="automation_settings")

class AutomationLog(Base):
    __tablename__ = "automation_logs"

    id = Column(Integer, primary_key=True, index=True)
    instagram_account_id = Column(Integer, ForeignKey("instagram_accounts.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String, default="INFO") # SYNC, SIMULATION, ALERT, INFO
    status = Column(String, default="SUCCESS") # SUCCESS, FAILED, INFO
    message = Column(Text, default="")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    account = relationship("InstagramAccount", back_populates="automation_logs")
