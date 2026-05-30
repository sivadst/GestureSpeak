"""
GestureSpeak - Real-time gesture recognition engine using MediaPipe.
Processes webcam frames, detects hand landmarks, classifies gestures,
and maps them to text in multiple languages.
"""
import time
import base64
import numpy as np
from typing import Optional, Dict, List, Tuple
from io import BytesIO
from PIL import Image

try:
    import mediapipe as mp
    from mediapipe.tasks.python import vision as mp_vision
    from mediapipe.tasks.python import BaseOptions
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

# Multi-language gesture maps
GESTURE_MAPS: Dict[str, Dict[str, str]] = {
    "en": {
        "Closed_Fist": "No / Stop",
        "Open_Palm": "Hello / Stop",
        "Pointing_Up": "I have a question",
        "Thumb_Down": "I disagree",
        "Thumb_Up": "Yes / I agree",
        "Victory": "Peace / Hello",
        "ILoveYou": "I love you",
        "None": "",
    },
    "es": {
        "Closed_Fist": "No / Para",
        "Open_Palm": "Hola / Para",
        "Pointing_Up": "Tengo una pregunta",
        "Thumb_Down": "No estoy de acuerdo",
        "Thumb_Up": "Sí / De acuerdo",
        "Victory": "Paz / Hola",
        "ILoveYou": "Te quiero",
        "None": "",
    },
    "fr": {
        "Closed_Fist": "Non / Arrête",
        "Open_Palm": "Bonjour / Arrête",
        "Pointing_Up": "J'ai une question",
        "Thumb_Down": "Je ne suis pas d'accord",
        "Thumb_Up": "Oui / D'accord",
        "Victory": "Paix / Bonjour",
        "ILoveYou": "Je t'aime",
        "None": "",
    },
    "hi": {
        "Closed_Fist": "नहीं / रुको",
        "Open_Palm": "नमस्ते / रुको",
        "Pointing_Up": "मेरा एक सवाल है",
        "Thumb_Down": "मैं सहमत नहीं हूँ",
        "Thumb_Up": "हाँ / सहमत",
        "Victory": "शांति / नमस्ते",
        "ILoveYou": "मैं तुमसे प्यार करता हूँ",
        "None": "",
    },
    "ja": {
        "Closed_Fist": "いいえ / 止まれ",
        "Open_Palm": "こんにちは / 止まれ",
        "Pointing_Up": "質問があります",
        "Thumb_Down": "反対です",
        "Thumb_Up": "はい / 賛成",
        "Victory": "ピース / こんにちは",
        "ILoveYou": "愛しています",
        "None": "",
    },
    "ar": {
        "Closed_Fist": "لا / توقف",
        "Open_Palm": "مرحبا / توقف",
        "Pointing_Up": "لدي سؤال",
        "Thumb_Down": "لا أوافق",
        "Thumb_Up": "نعم / موافق",
        "Victory": "سلام / مرحبا",
        "ILoveYou": "أحبك",
        "None": "",
    },
}

SUPPORTED_LANGUAGES = [
    {"code": "en", "name": "English", "flag": "🇺🇸"},
    {"code": "es", "name": "Español", "flag": "🇪🇸"},
    {"code": "fr", "name": "Français", "flag": "🇫🇷"},
    {"code": "hi", "name": "हिन्दी", "flag": "🇮🇳"},
    {"code": "ja", "name": "日本語", "flag": "🇯🇵"},
    {"code": "ar", "name": "العربية", "flag": "🇸🇦"},
]


class GestureRecognitionEngine:
    """High-performance gesture recognition with MediaPipe."""

    def __init__(self):
        self.recognizer = None
        self.is_initialized = False
        self._gesture_cooldown = 0.3  # seconds
        self._last_gesture = "None"
        self._last_gesture_time = 0.0
        self._confidence_threshold = 0.5
        self._init_engine()

    def _init_engine(self):
        """Initialize MediaPipe gesture recognizer."""
        if not MEDIAPIPE_AVAILABLE:
            print("[GestureEngine] MediaPipe not available - using simulation mode")
            return

        try:
            base_options = BaseOptions(
                model_asset_path="gesture_recognizer.task"
            )
            options = mp_vision.GestureRecognizerOptions(
                base_options=base_options,
                running_mode=mp_vision.RunningMode.IMAGE,
                num_hands=2,
                min_hand_detection_confidence=0.5,
                min_hand_presence_confidence=0.5,
                min_tracking_confidence=0.5,
            )
            self.recognizer = mp_vision.GestureRecognizer.create_from_options(options)
            self.is_initialized = True
            print("[GestureEngine] MediaPipe initialized successfully")
        except Exception as e:
            print(f"[GestureEngine] MediaPipe init failed: {e} - using simulation mode")
            self.is_initialized = False

    def process_frame_base64(self, frame_b64: str, language: str = "en") -> dict:
        """Process a base64-encoded frame and return gesture results."""
        try:
            # Decode base64 image
            if "," in frame_b64:
                frame_b64 = frame_b64.split(",")[1]

            img_bytes = base64.b64decode(frame_b64)
            img = Image.open(BytesIO(img_bytes)).convert("RGB")
            frame_np = np.array(img)

            return self._process_numpy_frame(frame_np, language)
        except Exception as e:
            return self._error_result(str(e))

    def _process_numpy_frame(self, frame: np.ndarray, language: str = "en") -> dict:
        """Process a numpy frame through the gesture recognition pipeline."""
        if not self.is_initialized or self.recognizer is None:
            return self._simulate_recognition(language)

        try:
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame)
            results = self.recognizer.recognize(mp_image)

            if results.gestures and len(results.gestures) > 0:
                gesture = results.gestures[0][0]
                gesture_name = gesture.category_name
                confidence = round(gesture.score, 4)

                # Apply cooldown
                now = time.time()
                if confidence < self._confidence_threshold:
                    gesture_name = "None"

                if gesture_name != "None":
                    self._last_gesture = gesture_name
                    self._last_gesture_time = now

                # Extract landmarks
                landmarks = []
                if results.hand_landmarks:
                    for hand in results.hand_landmarks:
                        hand_data = [
                            {"x": round(lm.x, 4), "y": round(lm.y, 4), "z": round(lm.z, 4)}
                            for lm in hand
                        ]
                        landmarks.append(hand_data)

                gesture_map = GESTURE_MAPS.get(language, GESTURE_MAPS["en"])
                text = gesture_map.get(gesture_name, "")

                return {
                    "gesture": gesture_name,
                    "confidence": confidence,
                    "text": text,
                    "language": language,
                    "landmarks": landmarks,
                    "handedness": [h[0].category_name for h in results.handedness] if results.handedness else [],
                    "timestamp": time.time(),
                }

            return {
                "gesture": "None",
                "confidence": 0.0,
                "text": "",
                "language": language,
                "landmarks": [],
                "handedness": [],
                "timestamp": time.time(),
            }

        except Exception as e:
            return self._error_result(str(e))

    def _simulate_recognition(self, language: str = "en") -> dict:
        """Fallback simulation when MediaPipe is not available."""
        import random
        gesture_map = GESTURE_MAPS.get(language, GESTURE_MAPS["en"])
        gestures = [g for g in gesture_map.keys() if g != "None"]

        now = time.time()
        if now - self._last_gesture_time > 3.0:
            gesture = random.choice(gestures)
            confidence = round(random.uniform(0.7, 0.99), 4)
            self._last_gesture = gesture
            self._last_gesture_time = now
        else:
            gesture = self._last_gesture
            confidence = round(random.uniform(0.85, 0.99), 4)

        # Generate simulated landmarks for one hand (21 points)
        landmarks = [[
            {"x": round(random.uniform(0.2, 0.8), 4),
             "y": round(random.uniform(0.2, 0.8), 4),
             "z": round(random.uniform(-0.1, 0.1), 4)}
            for _ in range(21)
        ]]

        return {
            "gesture": gesture,
            "confidence": confidence,
            "text": gesture_map.get(gesture, ""),
            "language": language,
            "landmarks": landmarks,
            "handedness": ["Right"],
            "timestamp": now,
            "simulated": True,
        }

    @staticmethod
    def _error_result(error: str) -> dict:
        return {
            "gesture": "None",
            "confidence": 0.0,
            "text": "",
            "error": error,
            "landmarks": [],
            "timestamp": time.time(),
        }

    def get_gesture_text(self, gesture: str, language: str = "en") -> str:
        gesture_map = GESTURE_MAPS.get(language, GESTURE_MAPS["en"])
        return gesture_map.get(gesture, "")

    @staticmethod
    def get_supported_gestures(language: str = "en") -> Dict[str, str]:
        return {k: v for k, v in GESTURE_MAPS.get(language, GESTURE_MAPS["en"]).items() if k != "None"}

    @staticmethod
    def get_supported_languages() -> List[dict]:
        return SUPPORTED_LANGUAGES


# Singleton engine
gesture_engine = GestureRecognitionEngine()
