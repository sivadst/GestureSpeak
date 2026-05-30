import json
import time
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
from app.services.gesture_engine import gesture_engine

router = APIRouter()


class ConnectionManager:
    """Manages active WebSocket connections for real-time gesture streaming."""

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        self.active_connections.pop(client_id, None)

    async def send_json(self, client_id: str, data: dict):
        ws = self.active_connections.get(client_id)
        if ws:
            try:
                await ws.send_json(data)
            except Exception:
                self.disconnect(client_id)

    async def broadcast(self, data: dict):
        disconnected = []
        for client_id, ws in self.active_connections.items():
            try:
                await ws.send_json(data)
            except Exception:
                disconnected.append(client_id)
        for cid in disconnected:
            self.disconnect(cid)


manager = ConnectionManager()


@router.websocket("/ws/gesture/{client_id}")
async def gesture_websocket(websocket: WebSocket, client_id: str):
    """
    WebSocket endpoint for real-time gesture recognition.
    Client sends base64 frames, server responds with gesture results.
    """
    await manager.connect(websocket, client_id)

    try:
        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "data": {"client_id": client_id, "timestamp": time.time()},
        })

        while True:
            # Receive frame from client
            raw = await websocket.receive_text()
            try:
                message = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "data": {"message": "Invalid JSON"}})
                continue

            msg_type = message.get("type", "")

            if msg_type == "frame":
                frame_b64 = message.get("frame", "")
                language = message.get("language", "en")

                # Process frame
                result = gesture_engine.process_frame_base64(frame_b64, language)
                await websocket.send_json({"type": "gesture_result", "data": result})

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong", "data": {"timestamp": time.time()}})

            elif msg_type == "simulate":
                language = message.get("language", "en")
                result = gesture_engine._simulate_recognition(language)
                await websocket.send_json({"type": "gesture_result", "data": result})

    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        manager.disconnect(client_id)
