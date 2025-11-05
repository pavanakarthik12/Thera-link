from typing import Dict, Any, Optional

def success_response(data: Optional[Dict[str, Any]] = None, message: str = "Success"):
    """
    Standard success response format.
    """
    return {
        "success": True,
        "message": message,
        "data": data or {}
    }

def error_response(message: str = "An error occurred", status_code: int = 400):
    """
    Standard error response format.
    """
    return {
        "success": False,
        "message": message,
        "status_code": status_code
    }