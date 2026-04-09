from pydantic import BaseModel


class EquipmentCreate(BaseModel):
    name: str
    type: str
    serial: str
    status: str


class EquipmentUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    serial: str | None = None
    status: str | None = None


class EquipmentResponse(BaseModel):
    id: int
    name: str
    type: str
    serial_number: str
    status: str

    class Config:
        from_attributes = True
