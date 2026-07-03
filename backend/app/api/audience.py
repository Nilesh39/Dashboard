from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud, schemas

router = APIRouter()

@router.get("/", response_model=schemas.AudienceInsightsOut)
def get_audience(db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    insights = crud.get_audience_insights(db, account.id)
    if not insights:
        raise HTTPException(status_code=404, detail="Audience insights not found")
    return insights

@router.put("/", response_model=schemas.AudienceInsightsOut)
def update_audience(updates: schemas.AudienceInsightsUpdate, db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    updated = crud.update_audience_insights(db, account.id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Audience insights not found")
    return updated
