"""Utility functions for the application."""
from datetime import datetime


def get_current_utc() -> datetime:
    """Get current UTC datetime."""
    return datetime.utcnow()


def format_log_message(level: str, message: str, **kwargs) -> dict:
    """Format structured log message as JSON."""
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "level": level,
        "message": message,
        **kwargs
    }
