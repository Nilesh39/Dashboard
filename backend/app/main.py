from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .api import profile, reels, analytics, audience, automation
from .scheduler import start_scheduler, shutdown_scheduler
from .crud import get_or_create_account
from .database import SessionLocal

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Pre-populate default account if database is fresh
db = SessionLocal()
try:
    get_or_create_account(db)
finally:
    db.close()

app = FastAPI(
    title="Instagram Analytics Automation API",
    description="Backend API for managing Instagram reels, profile metrics, audience stats, and live simulation growth.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this. For development, allow all.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Start background scheduler on startup and stop on shutdown
@app.on_event("startup")
def startup_event():
    start_scheduler()

@app.on_event("shutdown")
def shutdown_event():
    shutdown_scheduler()

# Register API Routers
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(reels.router, prefix="/api/reels", tags=["Reels"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(audience.router, prefix="/api/audience", tags=["Audience"])
app.include_router(automation.router, prefix="/api/automation", tags=["Automation"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Instagram Analytics Automation API is running.",
        "documentation": "/docs"
    }
