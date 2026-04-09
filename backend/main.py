from models import Equipment, User
from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt, JWTError
import hashlib

SECRET_KEY = "secret123"

app = FastAPI()

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# ================= DB =================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ================= HASH =================
def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

# ================= AUTH =================
def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token")

    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = payload.get("username")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

# ================= SCHEMAS =================
class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "user"

class LoginSchema(BaseModel):
    username: str
    password: str

class EquipmentSchema(BaseModel):
    name: str
    inv_num: str
    sn: str
    mac: str
    zav_num: str
    vendor: str
    model: str
    hostname: str
    street: str
    kor: str
    etaj: str
    kab: str
    status: str
    condition: str
    other: str

# ================= AUTH ENDPOINTS =================
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    exist = db.query(User).filter(User.username == user.username).first()

    if exist:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(user.password)

    new_user = User(
        username=user.username,
        password=hashed,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"ok": True}

@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()

    if not user or user.password != hash_password(data.password):
        raise HTTPException(status_code=400, detail="Wrong login")

    token = jwt.encode(
        {"username": user.username},
        SECRET_KEY,
        algorithm="HS256"
    )

    return {
        "access_token": token,
        "user": {
            "username": user.username,
            "role": user.role
        }
    }

# ================= EQUIPMENT ENDPOINTS =================
@app.get("/equipment")
def get_equipment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Equipment).all()

@app.post("/equipment")
def create_equipment(
    item: EquipmentSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new = Equipment(**item.dict())
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

@app.put("/equipment/{id}")
def update_equipment(
    id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.get(Equipment, id)

    if not item:
        raise HTTPException(status_code=404, detail="Not found")

    for key, value in data.items():
        setattr(item, key, value)

    db.commit()
    return item

@app.delete("/equipment/{id}")
def delete_equipment(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.get(Equipment, id)

    if not item:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(item)
    db.commit()
    return {"ok": True}