import os
import random
from typing import Tuple, Dict

# --- Configuration for Prioritization Weights ---
# These weights determine how much each factor contributes to the final 
# Issue Priority Score (0-100). These should be tuned based on real-world data.
WEIGHTS = {
    # Weight for the AI model's confidence in its classification (0.0 to 1.0)
    "AI_CONFIDENCE": 40,
    # Weight for the number of citizen votes/upvotes (scaled)
    "CITIZEN_VOTES": 40,
    # Weight for the initial status or historical relevance (e.g., if it's an emergency category)
    "STATUS_FACTOR": 20,
}
MAX_VOTES_FOR_FULL_SCORE = 50 

# --- Image Classification Simulation ---

def classify_image(image_path: str) -> Tuple[str, float]:
    """
    Mocks the execution of the trained AI model (e.g., a CNN) to classify 
    the issue type from the submitted photo and returns a confidence score.

    In a real implementation, this would load the model, preprocess the image, 
    and run inference.

    Args:
        image_path (str): The local file path to the uploaded image.

    Returns:
        Tuple[str, float]: (Detected Category, Confidence Score [0.0 - 1.0])
    """
    if not os.path.exists(image_path):
        # Handle the case where the file might not be immediately available
        # or path is invalid during testing.
        print(f"Warning: Image file not found at {image_path}. Using random data.")
        
    # Mock Logic based on categories mentioned in project files
    categories = ["Solid Waste", "Pothole", "Water Leak", "Illegal Dumping", "Street Light Out"]
    
    # Randomly select a category and generate a high confidence score 
    # to simulate a successful classification.
    detected_category = random.choice(categories)
    confidence = round(random.uniform(0.75, 0.99), 2)  # High confidence
    
    return detected_category, confidence


# --- Issue Prioritization Logic ---

def prioritize_issue(
    ai_confidence: float,
    votes_count: int,
    current_status: str
) -> int:
    """
    Calculates a final weighted priority score for an issue (0-100).
    This score helps administrators decide which issue to tackle first.
    
    The final score is a combination of AI certainty, citizen engagement (votes),
    and the issue's current status/type.

    Args:
        ai_confidence (float): Confidence score from the AI model (0.0 to 1.0).
        votes_count (int): Total number of citizen votes/upvotes for this issue.
        current_status (str): The issue's current administrative status.

    Returns:
        int: The final Priority Score (0 to 100).
    """
    
    # 1. AI Confidence Score (Max 40 points)
    # Scales the confidence score (0-1) to the weight (0-40)
    ai_score_weighted = ai_confidence * WEIGHTS["AI_CONFIDENCE"]
    
    # 2. Citizen Votes Score (Max 40 points)
    # Scales votes up to a maximum threshold (MAX_VOTES_FOR_FULL_SCORE).
    # This prevents issues with hundreds of votes from skewing the results too much.
    vote_ratio = min(votes_count, MAX_VOTES_FOR_FULL_SCORE) / MAX_VOTES_FOR_FULL_SCORE
    votes_score_weighted = vote_ratio * WEIGHTS["CITIZEN_VOTES"]

    # 3. Status/Type Factor Score (Max 20 points)
    # Assigns extra weight based on status (simulating an emergency category boost)
    status_factor = 0
    if current_status.lower() in ["reported", "pending"]:
        # Give a slight boost to freshly reported or pending items
        status_factor = 0.5 
    elif "emergency" in current_status.lower() or "critical" in current_status.lower():
        # Simulate a case where a critical status gets max status points
        status_factor = 1.0
        
    status_score_weighted = status_factor * WEIGHTS["STATUS_FACTOR"]

    # 4. Calculate Final Score (Total Max 100 points)
    final_score = (
        ai_score_weighted + 
        votes_score_weighted + 
        status_score_weighted
    )
    
    # Ensure the score is an integer between 0 and 100
    return int(round(min(max(final_score, 0), 100)))

# --- Example Usage (Self-contained test block) ---

if __name__ == '__main__':
    print("--- Running AI Prediction Engine Test ---")

    # Define a mock path (since no image exists)
    mock_image_path = "backend/static/uploads/issue_123.jpg"

    # 1. Run Classification
    category, confidence = classify_image(mock_image_path)
    print(f"\n[CLASSIFICATION RESULT]")
    print(f"Image Path: {mock_image_path}")
    print(f"Detected Category: {category}")
    print(f"AI Confidence: {confidence:.2f}")

    # 2. Run Prioritization Scenarios
    
    # Scenario 1: Fresh report, high AI confidence, no votes
    votes_s1 = 0
    status_s1 = "Reported"
    priority_1 = prioritize_issue(confidence, votes_s1, status_s1)
    
    # Scenario 2: Older report, medium AI confidence, lots of votes (maxed out)
    votes_s2 = 100 # This will be capped at MAX_VOTES_FOR_FULL_SCORE (50)
    confidence_s2 = 0.65
    status_s2 = "In Progress"
    priority_2 = prioritize_issue(confidence_s2, votes_s2, status_s2)

    print(f"\n[PRIORITIZATION SCENARIOS]")
    print(f"Scenario 1 (Fresh, No Votes):")
    print(f"  AI Score: {confidence:.2f}, Votes: {votes_s1}, Status: {status_s1}")
    print(f"  --> Final Priority Score: {priority_1}/100")
    
    print(f"Scenario 2 (Voted, In Progress):")
    print(f"  AI Score: {confidence_s2:.2f}, Votes: {votes_s2} (Capped), Status: {status_s2}")
    print(f"  --> Final Priority Score: {priority_2}/100")

    # This priority score ({priority_1} or {priority_2}) would be stored in the 'priority_score' column of the 'issues' table.
