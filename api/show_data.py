from datetime import datetime
from dotenv import load_dotenv
from os import getenv
from requests import get

load_dotenv()
api_key = getenv("TMDB_API_KEY")
base_url = "https://api.themoviedb.org/3"


def get_shows(first_air_date="1944-01-20", language="en-US"):
    all_shows = {}
    url = base_url + "/discover/tv"

    page = 1
    params = {
        "api_key": api_key,
        "first_air_date_year": first_air_date,
        "language": language,
        "page": page,
    }

    while True:
        response = get(url, params=params)
        data = response.json()
        for show in data["results"]:
            all_shows[show["id"]] = show["name"]
        if data["page"] == data["total_pages"]:
            break
        params["page"] += 1

    return all_shows
