# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth_routes, issue_routes, feedback_routes, admin_routes

Base.metadata.create_all(bind=engine)  # safe for dev

app = FastAPI(title="City Voice Backend")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # add your deployed frontend URL here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(issue_routes.router)
app.include_router(feedback_routes.router)
app.include_router(admin_routes.router)

@app.get("/")
def root():
    return {"message": "CityVoice Backend Running"}
