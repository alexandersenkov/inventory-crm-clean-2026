# backend/main.py
from models import Equipment, User, History
from fastapi import FastAPI, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt, JWTError
import hashlib
import json
import time
import logging
from datetime import datetime
from typing import Optional, List
from sqlalchemy import func

# ---------- НАСТРОЙКА ЛОГИРОВАНИЯ ----------
from logging.handlers import RotatingFileHandler
from pathlib import Path

LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

formatter = logging.Formatter(
    fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(filename)s:%(lineno)d | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.DEBUG)

file_handler = RotatingFileHandler(
    LOG_DIR / "app.log",
    maxBytes=5*1024*1024,
    backupCount=3,
    encoding="utf-8"
)
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.INFO)

# Настройка корневого логгера
logging.basicConfig(level=logging.DEBUG, handlers=[console_handler, file_handler])
logger = logging.getLogger(__name__)

# Уменьшаем шум от библиотек
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
logging.getLogger("uvicorn.error").setLevel(logging.INFO)
# -----------------------------------------

SECRET_KEY = "secret123"

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создаём таблицы при старте
Base.metadata.create_all(bind=engine)

# ---------- MIDDLEWARE ДЛЯ ЛОГИРОВАНИЯ ЗАПРОСОВ ----------
@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    start_time = time.time()
    logger.info(f"→ {request.method} {request.url.path} | Client: {request.client.host}")
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logger.info(f"← {request.method} {request.url.path} | Status: {response.status_code} | Time: {process_time:.2f}ms")
    return response

# ---------- ГЛОБАЛЬНЫЙ ОБРАБОТЧИК ИСКЛЮЧЕНИЙ ----------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
from fastapi.responses import JSONResponse

# ---------- ЗАВИСИМОСТЬ БД ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- ХЕШИРОВАНИЕ ----------
def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

# ---------- ФУНКЦИЯ ЛОГИРОВАНИЯ ДЕЙСТВИЙ (АУДИТ) ----------
def log_action(
    db: Session,
    user: str,
    action: str,
    equipment_id: int = None,
    equipment_name: str = None,
    changes: dict = None,
    ip_address: str = None
):
    """Запись действия в таблицу history"""
    try:
        history_entry = History(
            user=user,
            action=action,
            equipment_id=equipment_id,
            equipment_name=equipment_name,
            changes=json.dumps(changes, ensure_ascii=False) if changes else None,
            ip_address=ip_address
        )
        db.add(history_entry)
        db.commit()
        logger.debug(f"Audit log: {user} | {action} | equip_id={equipment_id}")
    except Exception as e:
        logger.error(f"Failed to write audit log: {e}")

# ---------- АВТОРИЗАЦИЯ ----------
def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization:
        logger.warning("Auth attempt without token")
        raise HTTPException(status_code=401, detail="No token")

    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = payload.get("username")
    except JWTError:
        logger.warning("Invalid token provided")
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        logger.warning(f"User from token not found: {username}")
        raise HTTPException(status_code=401, detail="User not found")

    return user

# ---------- PYDANTIC СХЕМЫ ----------
class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "user"

class LoginSchema(BaseModel):
    username: str
    password: str

class EquipmentSchema(BaseModel):
    name: str
    inv_num: str = ""
    sn: str = ""
    mac: str = ""
    zav_num: str = ""
    vendor: str = ""
    model: str = ""
    hostname: str = ""
    street: str = ""
    kor: str = ""
    etaj: str = ""
    kab: str = ""
    status: str = "в работе"
    condition: str = "готов к эксплуатации"
    other: str = ""

class HistoryResponse(BaseModel):
    id: int
    user: str
    action: str
    equipment_id: Optional[int] = None
    equipment_name: Optional[str] = None
    changes: Optional[str] = None
    timestamp: datetime
    ip_address: Optional[str] = None
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    class Config:
        from_attributes = True

class UserUpdateSchema(BaseModel):
    role: Optional[str] = None
    password: Optional[str] = None

# ---------- ЭНДПОИНТЫ АВТОРИЗАЦИИ ----------
@app.post("/register")
def register(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    logger.info(f"Registration attempt for username: {user.username} from IP: {request.client.host}")
    exist = db.query(User).filter(User.username == user.username).first()
    if exist:
        logger.warning(f"Registration failed: username {user.username} already exists")
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(user.password)
    new_user = User(username=user.username, password=hashed, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_action(
        db=db,
        user=user.username,
        action="REGISTER",
        changes={"data": {"username": user.username, "role": user.role}},
        ip_address=request.client.host
    )
    logger.info(f"User registered successfully: {user.username} with role {user.role}")
    return {"ok": True}

@app.post("/login")
def login(data: LoginSchema, request: Request, db: Session = Depends(get_db)):
    logger.info(f"Login attempt for user: {data.username} from IP: {request.client.host}")
    user = db.query(User).filter(User.username == data.username).first()
    if not user or user.password != hash_password(data.password):
        logger.warning(f"Failed login for user: {data.username}")
        raise HTTPException(status_code=400, detail="Wrong login")

    token = jwt.encode({"username": user.username}, SECRET_KEY, algorithm="HS256")
    log_action(
        db=db,
        user=user.username,
        action="LOGIN",
        ip_address=request.client.host
    )
    logger.info(f"User logged in: {user.username}")
    return {
        "access_token": token,
        "user": {"username": user.username, "role": user.role}
    }

# ---------- ЭНДПОИНТЫ ИСТОРИИ ----------
@app.get("/history", response_model=List[HistoryResponse])
def get_history(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.debug(f"History requested by {current_user.username}, skip={skip}, limit={limit}")
    history = db.query(History)\
        .order_by(History.timestamp.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return history

@app.get("/history/equipment/{equipment_id}")
def get_equipment_history(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.debug(f"Equipment history requested for id={equipment_id} by {current_user.username}")
    history = db.query(History)\
        .filter(History.equipment_id == equipment_id)\
        .order_by(History.timestamp.desc())\
        .all()
    return history

# ---------- ЭНДПОИНТЫ ОБОРУДОВАНИЯ ----------
@app.get("/equipment")
def get_equipment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.debug(f"Equipment list requested by {current_user.username}")
    return db.query(Equipment).all()

@app.post("/equipment")
def create_equipment(
    item: EquipmentSchema,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Creating equipment: {item.name} by {current_user.username}")
    new = Equipment(**item.model_dump())
    db.add(new)
    db.commit()
    db.refresh(new)

    log_action(
        db=db,
        user=current_user.username,
        action="CREATE",
        equipment_id=new.id,
        equipment_name=new.name,
        changes={"data": item.model_dump()},
        ip_address=request.client.host
    )
    logger.info(f"Equipment created: id={new.id}, name={new.name}")
    return new

@app.put("/equipment/{id}")
def update_equipment(
    id: int,
    data: dict,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Updating equipment id={id} by {current_user.username}")
    item = db.get(Equipment, id)
    if not item:
        logger.warning(f"Equipment id={id} not found for update")
        raise HTTPException(status_code=404, detail="Not found")

    old_data = {c.name: getattr(item, c.name) for c in item.__table__.columns if c.name != "id"}
    for key, value in data.items():
        if hasattr(item, key):
            setattr(item, key, value)
    db.commit()
    db.refresh(item)

    new_data = {c.name: getattr(item, c.name) for c in item.__table__.columns if c.name != "id"}
    changed_fields = {k: {"before": old_data[k], "after": new_data[k]} for k in old_data if old_data[k] != new_data[k]}

    log_action(
        db=db,
        user=current_user.username,
        action="UPDATE",
        equipment_id=item.id,
        equipment_name=item.name,
        changes={"before": old_data, "after": new_data, "changed": changed_fields},
        ip_address=request.client.host
    )
    logger.info(f"Equipment id={id} updated, changed fields: {list(changed_fields.keys())}")
    return item

@app.delete("/equipment/{id}")
def delete_equipment(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Deleting equipment id={id} by {current_user.username}")
    item = db.get(Equipment, id)
    if not item:
        logger.warning(f"Equipment id={id} not found for deletion")
        raise HTTPException(status_code=404, detail="Not found")

    deleted_data = {c.name: getattr(item, c.name) for c in item.__table__.columns}
    equipment_name = item.name

    db.delete(item)
    db.commit()

    log_action(
        db=db,
        user=current_user.username,
        action="DELETE",
        equipment_id=id,
        equipment_name=equipment_name,
        changes={"deleted_data": deleted_data},
        ip_address=request.client.host
    )
    logger.info(f"Equipment id={id} deleted")
    return {"ok": True}

# ---------- УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ (ТОЛЬКО ДЛЯ АДМИНОВ) ----------
@app.get("/users", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        logger.warning(f"Non-admin {current_user.username} tried to access user list")
        raise HTTPException(status_code=403, detail="Admin rights required")
    logger.debug(f"User list requested by admin {current_user.username}")
    return db.query(User).all()

@app.get("/users/stats")
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin rights required")
    total = db.query(User).count()
    roles = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    by_role = {role: count for role, count in roles}
    today = datetime.now().date()
    tomorrow = today + timedelta(days=1)
    active_today = db.query(History).filter(
        History.action == "LOGIN",
        History.timestamp >= today,
        History.timestamp < tomorrow
    ).distinct(History.user).count()
    return {
        "total": total,
        "by_role": by_role,
        "recent_registrations": 0,
        "active_today": active_today
    }
from datetime import timedelta

@app.get("/users/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "username": current_user.username, "role": current_user.role}

@app.put("/users/{user_id}")
def update_user(
    user_id: int,
    data: UserUpdateSchema,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin rights required")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.role is not None:
        user.role = data.role
    if data.password is not None:
        user.password = hash_password(data.password)
    db.commit()
    log_action(
        db=db,
        user=current_user.username,
        action="UPDATE_USER",
        changes={"user_id": user_id, "role": data.role, "password_changed": data.password is not None},
        ip_address=request.client.host
    )
    logger.info(f"User id={user_id} updated by {current_user.username}")
    return {"ok": True}

@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin rights required")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    username = user.username
    db.delete(user)
    db.commit()
    log_action(
        db=db,
        user=current_user.username,
        action="DELETE_USER",
        changes={"deleted_user": username, "user_id": user_id},
        ip_address=request.client.host
    )
    logger.info(f"User id={user_id} deleted by {current_user.username}")
    return {"ok": True}