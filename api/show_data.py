import requests
from dotenv import load_dotenv
from os import getenv

load_dotenv()
api_key = getenv("TMDB_API_KEY")
base_url = "https://api.themoviedb.org/3"


def get_shows(first_air_year=None, language="en-US"):
    all_shows = {}

    url = base_url + "/discover/tv"
    page = 1
    params = {
        "api_key": api_key,
        "first_air_date_year": first_air_year,
        "language": language,
        "page": page,
    }

    while True:
        response = requests.get(url, params=params)
        data = response.json()
        for show in data["results"]:
            all_shows[show["id"]] = show["name"]
        if data["page"] == data["total_pages"]:
            break
        params["page"] += 1

    return all_shows
