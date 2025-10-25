# backend/ai/predict.py
import random

# Replace with real model loading logic later
def predict_issue_category_from_image(image_path: str):
    """
    Input: image_path (local path or relative path)
    Output: (category, confidence)
    """
    choices = [("garbage", 0.88), ("pothole", 0.75), ("water_leak", 0.82), ("other", 0.60)]
    cat, conf = random.choice(choices)
    return cat, conf
