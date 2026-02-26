"""
Grievance classification service using ChatGroq with deterministic fallback.
"""
import json
import re
import logging
from typing import Dict
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings
from app.schemas import GrievanceClassification

logger = logging.getLogger(__name__)

# Exact system prompt as specified
SYSTEM_PROMPT = """SYSTEM: You are an automated municipal grievance classifier. ALWAYS output a single JSON object ONLY, with exact keys: {"department":"<one of: water,sanitation,roads,electricity,health,police,housing,general,miscellaneous>","priority":"<high|medium|low>","confidence":0.00-1.00,"explanation":"one-sentence rationale"}. Rules: choose one primary department only; priority: high = imminent danger/public safety/major outage; medium = service-impacting; low = cosmetic/single-user. Confidence numeric 0.0-1.0. Output must be parsable by json.loads and contain only JSON (no markdown or extra text). Examples: Human: "Water main burst on Main St, houses flooded." AI: {"department":"water","priority":"high","confidence":0.95,"explanation":"burst main flooding homes—immediate emergency for water department"} Human: "Streetlights off on Elm Road nightly for 2 weeks." AI: {"department":"electricity","priority":"medium","confidence":0.88,"explanation":"widespread streetlight outage affecting night safety"} Human: "Trash not collected in Sector 5, rats observed." AI: {"department":"sanitation","priority":"medium","confidence":0.86,"explanation":"missed collection causing public health risk"}"""


FALLBACK_RULES = [
    # (keywords, department, priority)
    (["water", "leak", "pipe", "burst", "tap", "supply"], "water", "medium"),
    (["garbage", "trash", "waste", "sewage", "sewer", "drain"], "sanitation", "medium"),
    (["road", "pothole", "crack", "street", "pavement"], "roads", "low"),
    (["power", "electricity", "outage", "streetlight", "lamp"], "electricity", "medium"),
    (["hospital", "clinic", "health", "medical", "ambulance"], "health", "high"),
    (["theft", "robbery", "crime", "police", "safety", "attack"], "police", "high"),
    (["building", "construction", "house", "apartment", "permit"], "housing", "low"),
]


def fallback_classify(message: str) -> Dict:
    """Simple keyword-based fallback classification."""
    message_lower = message.lower()
    
    for keywords, department, priority in FALLBACK_RULES:
        if any(kw in message_lower for kw in keywords):
            return {
                "department": department,
                "priority": priority,
                "confidence": 0.55,
                "explanation": f"fallback: matched {department} keywords"
            }
    
    # Default fallback
    return {
        "department": "miscellaneous",
        "priority": "low",
        "confidence": 0.45,
        "explanation": "fallback: unclear classification"
    }


def extract_json_from_response(text: str) -> Dict:
    """Extract JSON from response, handling markdown code blocks."""
    # Try direct parse first
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    
    # Try to find JSON in markdown code block
    json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass
    
    # Try to find raw JSON object
    json_match = re.search(r'\{[^{}]*"department"[^{}]*\}', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass
    
    return None


async def classify_grievance(message: str) -> GrievanceClassification:
    """
    Classify grievance using ChatGroq, with fallback to keyword-based classification.
    
    Returns strict JSON with: department, priority, confidence, explanation
    """
    if not settings.GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not set, using fallback")
        result = fallback_classify(message)
        return GrievanceClassification(**result)
    
    try:
        # Initialize ChatGroq
        llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name=settings.GROQ_MODEL,
            temperature=0.0,
            timeout=settings.GROQ_TIMEOUT
        )
        
        # Create messages
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=message)
        ]
        
        # Call LLM
        response = llm.invoke(messages)
        response_text = response.content.strip()
        
        # Extract JSON
        result_dict = extract_json_from_response(response_text)
        
        if result_dict:
            # Validate required keys
            required_keys = {"department", "priority", "confidence", "explanation"}
            if required_keys.issubset(result_dict.keys()):
                # Validate department value
                valid_departments = {"water", "sanitation", "roads", "electricity", "health", "police", "housing", "general", "miscellaneous"}
                if result_dict["department"] in valid_departments:
                    return GrievanceClassification(**result_dict)
        
        # If we got here, LLM response was invalid
        logger.warning(f"Invalid LLM response format: {response_text[:200]}")
        result = fallback_classify(message)
        return GrievanceClassification(**result)
        
    except Exception as e:
        logger.error(f"Classification error: {e}")
        result = fallback_classify(message)
        return GrievanceClassification(**result)
