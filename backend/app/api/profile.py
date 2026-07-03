from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud, schemas, simulation

router = APIRouter()

@router.get("/", response_model=schemas.InstagramAccountOut)
def get_profile(db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    
    # Run simulation catchup if active so it updates on-the-fly when reading
    simulation.run_simulation_catchup(db, account.id)
    
    # Refresh and return
    db.refresh(account)
    return account

@router.put("/", response_model=schemas.InstagramAccountOut)
def update_profile(updates: schemas.InstagramAccountUpdate, db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    updated = crud.update_account(db, account.id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Account not found")
    return updated

@router.post("/reset", response_model=schemas.InstagramAccountOut)
def reset_profile(db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    return crud.reset_database(db, account.id)

@router.post("/generate-demo", response_model=schemas.InstagramAccountOut)
def generate_demo(request: schemas.DemoDataRequest, db: Session = Depends(get_db)):
    account = crud.get_or_create_account(db)
    if request.tier not in ["1K", "10K", "100K", "1M", "10M"]:
        raise HTTPException(status_code=400, detail="Invalid followers tier. Must be 1K, 10K, 100K, 1M, or 10M.")
    return crud.generate_demo_data_for_tier(db, account.id, request.tier)
