"""
Test script to verify grievance classification is working correctly.
"""
import asyncio
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.classification_service import classify_grievance
from app.core.config import settings

# Test cases covering different departments and priorities
TEST_CASES = [
    {
        "message": "Water main burst on Main Street, houses are flooding",
        "expected_dept": "water",
        "expected_priority": "high"
    },
    {
        "message": "Garbage not collected in Sector 5 for 2 weeks, rats everywhere",
        "expected_dept": "sanitation",
        "expected_priority": "medium"
    },
    {
        "message": "Large pothole on Highway road causing accidents",
        "expected_dept": "roads",
        "expected_priority": "high"
    },
    {
        "message": "Street lights not working on Elm Road for a week",
        "expected_dept": "electricity",
        "expected_priority": "medium"
    },
    {
        "message": "Robbery in the park last night, need police patrol",
        "expected_dept": "police",
        "expected_priority": "high"
    },
    {
        "message": "Hospital ambulance service not responding to calls",
        "expected_dept": "health",
        "expected_priority": "high"
    },
    {
        "message": "Building construction without proper permit",
        "expected_dept": "housing",
        "expected_priority": "medium"
    },
    {
        "message": "Small crack in sidewalk near my house",
        "expected_dept": "roads",
        "expected_priority": "low"
    }
]


async def test_classification():
    """Test the classification service with various messages."""
    print("=" * 80)
    print("GRIEVANCE CLASSIFICATION TEST")
    print("=" * 80)
    print(f"\nGroq API Key configured: {'Yes' if settings.GROQ_API_KEY else 'No (using fallback)'}")
    print(f"Model: {settings.GROQ_MODEL}")
    print(f"\nTesting {len(TEST_CASES)} grievances...\n")
    
    passed = 0
    failed = 0
    
    for i, test_case in enumerate(TEST_CASES, 1):
        print(f"\n{'─' * 80}")
        print(f"Test {i}/{len(TEST_CASES)}")
        print(f"Message: {test_case['message']}")
        print(f"Expected: {test_case['expected_dept']} / {test_case['expected_priority']}")
        
        try:
            result = await classify_grievance(test_case['message'])
            
            print(f"\n✓ Result:")
            print(f"  Department:  {result.department}")
            print(f"  Priority:    {result.priority}")
            print(f"  Confidence:  {result.confidence:.2f}")
            print(f"  Explanation: {result.explanation}")
            
            dept_match = result.department == test_case['expected_dept']
            priority_match = result.priority == test_case['expected_priority']
            
            if dept_match and priority_match:
                print(f"\n✅ PASS - Perfect match!")
                passed += 1
            elif dept_match:
                print(f"\n⚠️  PARTIAL - Department correct, priority differs")
                passed += 0.5
                failed += 0.5
            else:
                print(f"\n❌ FAIL - Department mismatch")
                failed += 1
                
        except Exception as e:
            print(f"\n❌ ERROR: {str(e)}")
            failed += 1
    
    print(f"\n{'=' * 80}")
    print(f"SUMMARY")
    print(f"{'=' * 80}")
    print(f"Passed: {passed}/{len(TEST_CASES)}")
    print(f"Failed: {failed}/{len(TEST_CASES)}")
    accuracy = (passed / len(TEST_CASES)) * 100
    print(f"Accuracy: {accuracy:.1f}%")
    
    if accuracy >= 80:
        print(f"\n✅ Classification system is working well!")
    elif accuracy >= 60:
        print(f"\n⚠️  Classification system is working but could be improved")
    else:
        print(f"\n❌ Classification system needs attention")
    
    print(f"\n{'=' * 80}\n")


if __name__ == "__main__":
    asyncio.run(test_classification())
