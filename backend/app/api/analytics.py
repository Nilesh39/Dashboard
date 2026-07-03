from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import crud, schemas

router = APIRouter()

@router.get("/history", response_model=List[schemas.AnalyticsHistoryOut])
def get_history(db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    return crud.get_analytics_history(db, account.id)

@router.post("/history", response_model=schemas.AnalyticsHistoryOut, status_code=status.HTTP_201_CREATED)
def add_history_record(record: schemas.AnalyticsHistoryCreate, db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    return crud.add_analytics_history_record(db, account.id, record)

@router.delete("/history/{history_id}")
def delete_history_record(history_id: int, db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    success = crud.delete_analytics_history_record(db, history_id, account.id)
    if not success:
        raise HTTPException(status_code=404, detail="Historical record not found")
    return {"status": "success", "message": f"Historical record {history_id} deleted successfully"}
