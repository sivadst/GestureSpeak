from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# Auth schemas
class UserCreate(BaseModel):
    email: str
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6)
    full_name: str = ""


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    avatar_url: str
    preferred_language: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Translation schemas
class TranslationCreate(BaseModel):
    input_type: str
    input_data: str = ""
    output_text: str = ""
    output_language: str = "en"
    confidence: float = 0.0
    gesture_name: str = ""
    duration_ms: int = 0


class TranslationResponse(BaseModel):
    id: int
    input_type: str
    input_data: str
    output_text: str
    output_language: str
    confidence: float
    gesture_name: str
    duration_ms: int
    created_at: datetime

    class Config:
        from_attributes = True


# Gesture schemas
class GestureResult(BaseModel):
    gesture: str
    confidence: float
    landmarks: Optional[List[dict]] = None
    text: str = ""
    timestamp: float = 0.0


class GestureMapEntry(BaseModel):
    gesture: str
    text: str
    language: str = "en"


# Settings schemas
class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    font_size: Optional[int] = None
    high_contrast: Optional[bool] = None
    speech_rate: Optional[float] = None
    speech_voice: Optional[str] = None
    auto_speak: Optional[bool] = None
    camera_resolution: Optional[str] = None
    show_landmarks: Optional[bool] = None
    show_confidence: Optional[bool] = None


class UserSettingsResponse(BaseModel):
    theme: str
    font_size: int
    high_contrast: bool
    speech_rate: float
    speech_voice: str
    auto_speak: bool
    camera_resolution: str
    show_landmarks: bool
    show_confidence: bool

    class Config:
        from_attributes = True


# Analytics schemas
class DashboardStats(BaseModel):
    total_translations: int
    translations_today: int
    unique_gestures: int
    avg_confidence: float
    top_gestures: List[dict]
    recent_translations: List[TranslationResponse]


# WebSocket schemas
class WSMessage(BaseModel):
    type: str  # gesture_result, error, status
    data: dict
