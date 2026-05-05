from __future__ import annotations
from dataclasses import dataclass
from typing import Generic, List, Optional, TypeVar, Dict, Any
import base64
import json

T = TypeVar("T")

# make the dictionary a URL safe string
def encode_cursor(payload: Dict[str, Any]) -> str:
    raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")

# reverse the encoding
def decode_cursor(cursor: str) -> Dict[str, Any]:
    # add missing padding
    padded = cursor + "=" * (-len(cursor) % 4)
    raw = base64.urlsafe_b64decode(padded.encode("utf-8"))
    return json.loads(raw.decode("utf-8"))

# using generics so we can swap the data passed
@dataclass(frozen=True, slots=True)
class CursorPage(Generic[T]):
    items: List[T]
    next_cursor: Optional[str]
    has_more: bool
