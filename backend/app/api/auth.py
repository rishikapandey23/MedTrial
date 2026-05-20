from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import get_db, MongoModel
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.schemas.schemas import UserCreate, UserResponse, Token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db = Depends(get_db)):
    # Check if user already exists
    db_user = db.users.find_one({"email": user_in.email})
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An investigator account with this email already exists."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    new_user_dict = {
        "email": user_in.email,
        "name": user_in.name,
        "hashed_password": hashed_pwd,
        "role": user_in.role or "Lead Investigator",
        "created_at": datetime.utcnow()
    }
    
    result = db.users.insert_one(new_user_dict)
    new_user_dict["id"] = str(result.inserted_id)
    return MongoModel(new_user_dict)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    # Verify username (email) and password
    user = db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Generate access token
    user["id"] = str(user["_id"])
    access_token = create_access_token(data={"sub": user["email"], "id": user["id"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": MongoModel(user)
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user = Depends(get_current_user)):
    return current_user
