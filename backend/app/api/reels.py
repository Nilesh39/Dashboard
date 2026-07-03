from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import crud, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.ReelOut])
def get_reels(db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    return crud.get_reels(db, account.id)

@router.post("/", response_model=schemas.ReelOut, status_code=status.HTTP_201_CREATED)
def create_reel(reel_in: schemas.ReelCreate, db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    return crud.create_reel(db, account.id, reel_in)

@router.put("/{reel_id}", response_model=schemas.ReelOut)
def update_reel(reel_id: int, updates: schemas.ReelUpdate, db: Session = Depends(get_db)):
    updated = crud.update_reel(db, reel_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Reel not found")
    return updated

@router.post("/{reel_id}/duplicate", response_model=schemas.ReelOut)
def duplicate_reel(reel_id: int, db: Session = Depends(get_db)):
    duplicated = crud.duplicate_reel(db, reel_id)
    if not duplicated:
        raise HTTPException(status_code=404, detail="Original reel not found")
    return duplicated

@router.delete("/{reel_id}")
def delete_reel(reel_id: int, db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    success = crud.delete_reel(db, reel_id, account.id)
    if not success:
        raise HTTPException(status_code=404, detail="Reel not found")
    return {"status": "success", "message": f"Reel {reel_id} deleted successfully"}

@router.put("/bulk/update")
def bulk_update(updates: schemas.ReelBulkUpdate, db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    success = crud.bulk_update_reels(db, account.id, updates)
    if not success:
        raise HTTPException(status_code=400, detail="Bulk update failed")
    return {"status": "success", "message": "Bulk update completed successfully"}
