from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from os import getenv
from requests import get

load_dotenv()
TMDB_API_KEY = getenv("TMDB_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/search/tv")
def search_tv(query: str):
    url = f"https://api.themoviedb.org/3/search/tv?api_key={TMDB_API_KEY}&query={query}"
    response = get(url)
    return response.json()


@app.get("/tv/{show_id}")
def get_tv(show_id: int):
    url = f"https://api.themoviedb.org/3/tv/{show_id}?api_key={TMDB_API_KEY}"
    response = get(url)
    return response.json()


@app.get("/tv/{show_id}/season/{season_id}")
def get_season(show_id: int, season_id: int):
    url = f"https://api.themoviedb.org/3/tv/{show_id}/season/{season_id}?api_key={TMDB_API_KEY}"
    response = get(url)
    return response.json()
