from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import crud, schemas, scheduler, simulation

router = APIRouter()

@router.get("/settings", response_model=schemas.AutomationSettingsOut)
def get_settings(db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    return crud.get_automation_settings(db, account.id)

@router.put("/settings", response_model=schemas.AutomationSettingsOut)
def update_settings(updates: schemas.AutomationSettingsUpdate, db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    return crud.update_automation_settings(db, account.id, updates)

@router.get("/logs", response_model=List[schemas.AutomationLogOut])
def get_logs(db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    return crud.get_automation_logs(db, account.id)

@router.post("/logs/clear")
def clear_logs(db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    crud.clear_logs(db, account.id)
    return {"status": "success", "message": "Automation logs cleared successfully"}

@router.post("/trigger-sync")
def trigger_sync(db: Session = Depends(get_db)):
    """
    Manually triggers the background sync and simulation job immediately.
    """
    try:
        # We invoke the job function directly
        scheduler.sync_job()
        return {"status": "success", "message": "Manual sync job executed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Manual sync failed: {str(e)}")
