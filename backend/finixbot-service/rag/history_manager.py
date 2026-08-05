from typing import List, Dict
from models.schemas import MessageTurn

def format_history(history: List[MessageTurn], max_turns: int = 4) -> str:
    """
    Formats the last N conversation turns into a string for inclusion in prompt.
    """
    if not history:
        return ""

    recent_turns = history[-max_turns:]
    formatted = []
    for turn in recent_turns:
        role_label = "Customer" if turn.role.lower() == "user" else "FinixBot"
        formatted.append(f"{role_label}: {turn.content}")

    return "\n".join(formatted)
