# backend/utils/notifications.py
def send_notification_console(user_id: str, message: str):
    # Simple stub: in hackathon, just log/send to console
    print(f"[NOTIFY] To {user_id}: {message}")

# Later: integrate Twilio/WhatsApp by replacing this function with API calls.
def send_notification_twilio(user_id: str, message: str):
    from twilio.rest import Client
    import os

    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    try:
        message = client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=user_id  # Assuming user_id is the phone number
        )
        print(f"[NOTIFY] Sent to {user_id}: SID {message.sid}")
    except Exception as e:
        print(f"[NOTIFY] Failed to send to {user_id}: {e}")