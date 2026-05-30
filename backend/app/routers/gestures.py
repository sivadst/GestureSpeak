from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.database import get_db
from app.models import User, TranslationHistory
from app.schemas import TranslationCreate, TranslationResponse, DashboardStats
from app.auth import get_current_user
from app.services.gesture_engine import gesture_engine, GESTURE_MAPS, SUPPORTED_LANGUAGES

router = APIRouter(prefix="/api/gestures", tags=["Gestures"])


@router.post("/recognize")
async def recognize_gesture(
    frame_data: dict,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
):
    """Process a single frame and return gesture recognition result."""
    frame_b64 = frame_data.get("frame", "")
    language = frame_data.get("language", "en")

    result = gesture_engine.process_frame_base64(frame_b64, language)

    # Save to history if authenticated and gesture detected
    if user and result.get("gesture") != "None" and result.get("confidence", 0) > 0.5:
        history = TranslationHistory(
            user_id=user.id,
            input_type="gesture",
            input_data=result["gesture"],
            output_text=result.get("text", ""),
            output_language=language,
            confidence=result.get("confidence", 0),
            gesture_name=result["gesture"],
        )
        db.add(history)
        await db.commit()

    return result


@router.get("/supported")
async def get_supported_gestures(language: str = "en"):
    """Get all supported gestures with their text mappings."""
    return {
        "gestures": gesture_engine.get_supported_gestures(language),
        "language": language,
    }


@router.get("/languages")
async def get_languages():
    """Get all supported languages."""
    return {"languages": SUPPORTED_LANGUAGES}


@router.get("/history", response_model=list[TranslationResponse])
async def get_history(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get translation history for authenticated user."""
    if not user:
        return []
    result = await db.execute(
        select(TranslationHistory)
        .where(TranslationHistory.user_id == user.id)
        .order_by(TranslationHistory.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
):
    """Get dashboard statistics."""
    if not user:
        return {
            "total_translations": 0,
            "translations_today": 0,
            "unique_gestures": 0,
            "avg_confidence": 0,
            "top_gestures": [],
            "recent_translations": [],
        }

    # Total translations
    total = await db.execute(
        select(func.count(TranslationHistory.id)).where(TranslationHistory.user_id == user.id)
    )
    total_count = total.scalar() or 0

    # Today's translations
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today = await db.execute(
        select(func.count(TranslationHistory.id))
        .where(TranslationHistory.user_id == user.id)
        .where(TranslationHistory.created_at >= today_start)
    )
    today_count = today.scalar() or 0

    # Unique gestures
    unique = await db.execute(
        select(func.count(func.distinct(TranslationHistory.gesture_name)))
        .where(TranslationHistory.user_id == user.id)
    )
    unique_count = unique.scalar() or 0

    # Avg confidence
    avg_conf = await db.execute(
        select(func.avg(TranslationHistory.confidence)).where(TranslationHistory.user_id == user.id)
    )
    avg_confidence = round(avg_conf.scalar() or 0, 2)

    # Top gestures
    top = await db.execute(
        select(TranslationHistory.gesture_name, func.count(TranslationHistory.id).label("count"))
        .where(TranslationHistory.user_id == user.id)
        .where(TranslationHistory.gesture_name != "")
        .group_by(TranslationHistory.gesture_name)
        .order_by(func.count(TranslationHistory.id).desc())
        .limit(5)
    )
    top_gestures = [{"gesture": row[0], "count": row[1]} for row in top.all()]

    # Recent translations
    recent = await db.execute(
        select(TranslationHistory)
        .where(TranslationHistory.user_id == user.id)
        .order_by(TranslationHistory.created_at.desc())
        .limit(10)
    )
    recent_list = [TranslationResponse.model_validate(r) for r in recent.scalars().all()]

    return {
        "total_translations": total_count,
        "translations_today": today_count,
        "unique_gestures": unique_count,
        "avg_confidence": avg_confidence,
        "top_gestures": top_gestures,
        "recent_translations": recent_list,
    }
