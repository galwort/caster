from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from json import load

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/shows")
def read_shows():
    with open("shows.json", "r") as file:
        shows = load(file)
    return shows
