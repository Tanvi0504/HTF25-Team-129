from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routes import auth_routes

# Create all tables (optional; can skip if DB already made)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="City Voice Backend")

# Allow frontend requests
origins = [
    "http://localhost:5173",  # React dev server
    "https://your-frontend-domain.com"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth_routes.router)

@app.get("/")
def home():
    return {"message": "City Voice API is running!"}
