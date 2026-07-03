from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from datetime import datetime

# Helper to parse human-readable metric strings (e.g., "1.5M", "10K", "10,000") to integers.
def parse_string_metric(v: Any) -> int:
    if isinstance(v, (int, float)):
        return int(v)
    if isinstance(v, str):
        v_clean = v.strip().replace(",", "").upper()
        if not v_clean:
            return 0
        try:
            if v_clean.endswith("K"):
                return int(float(v_clean[:-1]) * 1000)
            elif v_clean.endswith("M"):
                return int(float(v_clean[:-1]) * 1000000)
            elif v_clean.endswith("B"):
                return int(float(v_clean[:-1]) * 1000000000)
            return int(float(v_clean))
        except ValueError:
            return 0
    return 0

class FlexibleMetric:
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        return parse_string_metric(v)

# Base Schemas
class ReelBase(BaseModel):
    title: str = ""
    media_url: str = ""
    thumbnail_url: str = ""
    views: Union[int, str] = 0
    likes: Union[int, str] = 0
    comments: Union[int, str] = 0
    shares: Union[int, str] = 0
    saves: Union[int, str] = 0
    reach: Union[int, str] = 0
    watch_time_hours: float = 0.0

class ReelCreate(ReelBase):
    pass

class ReelUpdate(BaseModel):
    title: Optional[str] = None
    media_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    views: Optional[Union[int, str]] = None
    likes: Optional[Union[int, str]] = None
    comments: Optional[Union[int, str]] = None
    shares: Optional[Union[int, str]] = None
    saves: Optional[Union[int, str]] = None
    reach: Optional[Union[int, str]] = None
    watch_time_hours: Optional[float] = None
    engagement_rate: Optional[float] = None

class ReelOut(BaseModel):
    id: int
    instagram_account_id: int
    title: str
    media_url: str
    thumbnail_url: str
    views: int
    likes: int
    comments: int
    shares: int
    saves: int
    reach: int
    watch_time_hours: float
    engagement_rate: float
    created_at: datetime

    class Config:
        from_attributes = True

class ReelBulkUpdate(BaseModel):
    reels: List[Dict[str, Any]] # list of dicts with id and fields to update

class InstagramAccountBase(BaseModel):
    username: str
    full_name: str = ""
    bio: str = ""
    profile_pic_url: str = ""
    followers_count: Union[int, str] = 0
    following_count: Union[int, str] = 0
    posts_count: Union[int, str] = 0
    reels_count: Union[int, str] = 0
    total_reach: Union[int, str] = 0
    total_engagement: Union[int, str] = 0
    theme_settings: Dict[str, Any] = {}

class InstagramAccountUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_pic_url: Optional[str] = None
    followers_count: Optional[Union[int, str]] = None
    following_count: Optional[Union[int, str]] = None
    posts_count: Optional[Union[int, str]] = None
    reels_count: Optional[Union[int, str]] = None
    total_reach: Optional[Union[int, str]] = None
    total_engagement: Optional[Union[int, str]] = None
    theme_settings: Optional[Dict[str, Any]] = None

class InstagramAccountOut(BaseModel):
    id: int
    username: str
    full_name: str
    bio: str
    profile_pic_url: str
    followers_count: int
    following_count: int
    posts_count: int
    reels_count: int
    total_reach: int
    total_engagement: int
    theme_settings: Dict[str, Any]
    updated_at: datetime

    class Config:
        from_attributes = True

class AnalyticsHistoryBase(BaseModel):
    followers: Union[int, str] = 0
    following: Union[int, str] = 0
    posts: Union[int, str] = 0
    reach: Union[int, str] = 0
    engagement: Union[int, str] = 0
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AnalyticsHistoryCreate(AnalyticsHistoryBase):
    pass

class AnalyticsHistoryOut(BaseModel):
    id: int
    instagram_account_id: int
    followers: int
    following: int
    posts: int
    reach: int
    engagement: int
    timestamp: datetime

    class Config:
        from_attributes = True

class AudienceInsightsUpdate(BaseModel):
    male_percentage: Optional[float] = None
    female_percentage: Optional[float] = None
    age_distribution: Optional[Dict[str, float]] = None
    country_distribution: Optional[Dict[str, float]] = None
    followers_vs_non_followers: Optional[Dict[str, float]] = None

class AudienceInsightsOut(BaseModel):
    id: int
    instagram_account_id: int
    male_percentage: float
    female_percentage: float
    age_distribution: Dict[str, float]
    country_distribution: Dict[str, float]
    followers_vs_non_followers: Dict[str, float]

    class Config:
        from_attributes = True

class AutomationSettingsUpdate(BaseModel):
    simulation_active: Optional[bool] = None
    growth_rate_followers_per_day: Optional[int] = None

class AutomationSettingsOut(BaseModel):
    id: int
    instagram_account_id: int
    simulation_active: bool
    growth_rate_followers_per_day: int
    last_simulation_run: datetime

    class Config:
        from_attributes = True

class AutomationLogOut(BaseModel):
    id: int
    instagram_account_id: int
    event_type: str
    status: str
    message: str
    timestamp: datetime

    class Config:
        from_attributes = True

class DemoDataRequest(BaseModel):
    tier: str # "1K", "10K", "100K", "1M", "10M"
