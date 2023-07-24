import json

def construct_detail(code: str, message: str = None, data: dict[str, str] = None) -> str:
    return json.dumps({
        "code": code,
        "message": message,
        "data": data
    })