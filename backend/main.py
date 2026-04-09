from models import Equipment, User, History
from fastapi import FastAPI, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt, JWTError
import hashlib
import json
from datetime import datetime
from typing import Optional
from sqlalchemy import func

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

# Создаём таблицы при запуске
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

# ================= LOGGING FUNCTION =================
def log_action(
    db: Session,
    user: str,
    action: str,
    equipment_id: int = None,
    equipment_name: str = None,
    changes: dict = None,
    ip_address: str = None
):
    """Функция для записи действий в историю"""
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

# ================= AUTH ENDPOINTS =================
@app.post("/register")
def register(user: UserCreate, request: Request, db: Session = Depends(get_db)):
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
    
    # Логируем регистрацию
    log_action(
        db=db,
        user=user.username,
        action="REGISTER",
        changes={"data": {"username": user.username, "role": user.role}},
        ip_address=request.client.host
    )

    return {"ok": True}

@app.post("/login")
def login(data: LoginSchema, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()

    if not user or user.password != hash_password(data.password):
        raise HTTPException(status_code=400, detail="Wrong login")

    token = jwt.encode(
        {"username": user.username},
        SECRET_KEY,
        algorithm="HS256"
    )
    
    # Логируем вход
    log_action(
        db=db,
        user=user.username,
        action="LOGIN",
        ip_address=request.client.host
    )

    return {
        "access_token": token,
        "user": {
            "username": user.username,
            "role": user.role
        }
    }

# ================= HISTORY ENDPOINTS =================
@app.get("/history", response_model=list[HistoryResponse])
def get_history(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить историю действий"""
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
    """Получить историю конкретного оборудования"""
    history = db.query(History)\
        .filter(History.equipment_id == equipment_id)\
        .order_by(History.timestamp.desc())\
        .all()
    return history

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
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new = Equipment(**item.model_dump())
    db.add(new)
    db.commit()
    db.refresh(new)
    
    # Логируем создание
    log_action(
        db=db,
        user=current_user.username,
        action="CREATE",
        equipment_id=new.id,
        equipment_name=new.name,
        changes={"data": item.model_dump()},
        ip_address=request.client.host
    )
    
    return new

@app.put("/equipment/{id}")
def update_equipment(
    id: int,
    data: dict,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.get(Equipment, id)

    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    
    # Сохраняем старые значения
    old_data = {
        "name": item.name,
        "inv_num": item.inv_num,
        "sn": item.sn,
        "mac": item.mac,
        "zav_num": item.zav_num,
        "vendor": item.vendor,
        "model": item.model,
        "hostname": item.hostname,
        "street": item.street,
        "kor": item.kor,
        "etaj": item.etaj,
        "kab": item.kab,
        "status": item.status,
        "condition": item.condition,
        "other": item.other
    }

    # Применяем изменения
    for key, value in data.items():
        if hasattr(item, key):
            setattr(item, key, value)

    db.commit()
    db.refresh(item)
    
    # Новые значения
    new_data = {
        "name": item.name,
        "inv_num": item.inv_num,
        "sn": item.sn,
        "mac": item.mac,
        "zav_num": item.zav_num,
        "vendor": item.vendor,
        "model": item.model,
        "hostname": item.hostname,
        "street": item.street,
        "kor": item.kor,
        "etaj": item.etaj,
        "kab": item.kab,
        "status": item.status,
        "condition": item.condition,
        "other": item.other
    }
    
    # Находим изменённые поля
    changed_fields = {}
    for key in old_data:
        if old_data[key] != new_data[key]:
            changed_fields[key] = {
                "before": old_data[key],
                "after": new_data[key]
            }
    
    # Логируем обновление
    log_action(
        db=db,
        user=current_user.username,
        action="UPDATE",
        equipment_id=item.id,
        equipment_name=item.name,
        changes={"before": old_data, "after": new_data, "changed": changed_fields},
        ip_address=request.client.host
    )
    
    return item

@app.delete("/equipment/{id}")
def delete_equipment(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.get(Equipment, id)

    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    
    # Сохраняем данные перед удалением
    deleted_data = {
        "id": item.id,
        "name": item.name,
        "inv_num": item.inv_num,
        "sn": item.sn,
        "mac": item.mac,
        "zav_num": item.zav_num,
        "vendor": item.vendor,
        "model": item.model,
        "hostname": item.hostname,
        "street": item.street,
        "kor": item.kor,
        "etaj": item.etaj,
        "kab": item.kab,
        "status": item.status,
        "condition": item.condition,
        "other": item.other
    }
    
    equipment_name = item.name

    db.delete(item)
    db.commit()
    
    # Логируем удаление
    log_action(
        db=db,
        user=current_user.username,
        action="DELETE",
        equipment_id=id,
        equipment_name=equipment_name,
        changes={"deleted_data": deleted_data},
        ip_address=request.client.host
    )
    
    return {"ok": True}
    
    # Вставьте эти эндпоинты в main.py после существующих
    
    # ================= USER MANAGEMENT ENDPOINTS =================
    
    class UserResponse(BaseModel):
        id: int
        username: str
        role: str
        
        class Config:
            from_attributes = True
    
    class UserUpdateSchema(BaseModel):
        role: Optional[str] = None
        password: Optional[str] = None
    
    class UserStatsResponse(BaseModel):
        total: int
        by_role: dict
        recent_registrations: int  # за последние 7 дней
        active_today: int  # логинились сегодня
    
    @app.get("/users", response_model=list[UserResponse])
    def get_users(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):
        """Получить список всех пользователей (только для админов)"""
        # Проверка на админа
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Требуются права администратора")
        
        users = db.query(User).all()
        return users
    
    
    @app.get("/users/stats")
    def get_user_stats(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):
        """Получить статистику по пользователям"""
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Требуются права администратора")
        
        from datetime import datetime, timedelta
        
        total_users = db.query(User).count()
        
        # По ролям
        users_by_role = {}
        roles = db.query(User.role, func.count(User.id)).group_by(User.role).all()
        for role, count in roles:
            users_by_role[role] = count
        
        # Зарегистрировались за последние 7 дней (если есть поле created_at)
        # Если поля created_at нет, вернём 0
        recent = 0
        
        # Активные сегодня (логинились)
        today = datetime.now().date()
        tomorrow = today + timedelta(days=1)
        
        active_today = db.query(History).filter(
            History.action == "LOGIN",
            History.timestamp >= today,
            History.timestamp < tomorrow
        ).distinct(History.user).count()
        
        return {
            "total": total_users,
            "by_role": users_by_role,
            "recent_registrations": recent,
            "active_today": active_today
        }
    
    
    @app.get("/users/me")
    def get_current_user_info(
        current_user: User = Depends(get_current_user)
    ):
        """Получить информацию о текущем пользователе"""
        return {
            "id": current_user.id,
            "username": current_user.username,
            "role": current_user.role
        }
    
    
    @app.put("/users/{user_id}")
    def update_user(
        user_id: int,
        data: UserUpdateSchema,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):
        """Обновить роль или пароль пользователя (только для админов)"""
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Требуются права администратора")
        
        user = db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        if data.role is not None:
            user.role = data.role
        
        if data.password is not None:
            user.password = hash_password(data.password)
        
        db.commit()
        
        # Логируем изменение
        log_action(
            db=db,
            user=current_user.username,
            action="UPDATE_USER",
            changes={"user_id": user_id, "role": data.role, "password_changed": data.password is not None}
        )
        
        return {"ok": True, "message": "Пользователь обновлён"}
    
    
    @app.delete("/users/{user_id}")
    def delete_user(
        user_id: int,
        request: Request,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):
        """Удалить пользователя (только для админов)"""
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Требуются права администратора")
        
        user = db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        # Нельзя удалить самого себя
        if user.id == current_user.id:
            raise HTTPException(status_code=400, detail="Нельзя удалить самого себя")
        
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
        
        return {"ok": True, "message": f"Пользователь {username} удалён"}