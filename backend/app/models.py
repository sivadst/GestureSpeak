from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), default="")
    avatar_url = Column(String(500), default="")
    preferred_language = Column(String(10), default="en")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    translations = relationship("TranslationHistory", back_populates="user")
    settings = relationship("UserSettings", back_populates="user", uselist=False)


class TranslationHistory(Base):
    __tablename__ = "translation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    input_type = Column(String(50), nullable=False)  # gesture, speech, text
    input_data = Column(Text, default="")
    output_text = Column(Text, default="")
    output_language = Column(String(10), default="en")
    confidence = Column(Float, default=0.0)
    gesture_name = Column(String(100), default="")
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="translations")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    theme = Column(String(20), default="dark")
    font_size = Column(Integer, default=16)
    high_contrast = Column(Boolean, default=False)
    speech_rate = Column(Float, default=1.0)
    speech_voice = Column(String(100), default="default")
    auto_speak = Column(Boolean, default=True)
    camera_resolution = Column(String(20), default="720p")
    show_landmarks = Column(Boolean, default=True)
    show_confidence = Column(Boolean, default=True)

    user = relationship("User", back_populates="settings")
