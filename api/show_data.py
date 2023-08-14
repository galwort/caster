from datetime import datetime
from dotenv import load_dotenv
from json import dump
from os import getenv
from requests import get

load_dotenv()
api_key = getenv("TMDB_API_KEY")
base_url = "https://api.themoviedb.org/3"


def get_shows_by_date(first_air_date="1944-01-20", language="en-US"):
    shows = {}
    url = base_url + "/discover/tv"
    page = 1
    params = {
        "api_key": api_key,
        "first_air_date": first_air_date,
        "language": language,
        "page": page,
    }

    while True:
        print(f"Getting page {params['page']} of shows")
        response = get(url, params=params)
        data = response.json()
        for show in data["results"]:
            shows[show["id"]] = show["name"]
        if data["page"] == data["total_pages"]:
            break
        params["page"] += 1

    with open("shows.json", "w") as file:
        dump(shows, file)


def get_shows_by_year(first_air_year=1944, language="en_us"):
    shows = {}
    url = base_url + "/discover/tv"

    for year in range(first_air_year, datetime.now().year + 1):
        page = 1
        params = {
            "api_key": api_key,
            "first_air_date_year": year,
            "language": language,
            "page": page,
        }

        while True:
            response = get(url, params=params)
            data = response.json()
            for show in data["results"]:
                shows[show["id"]] = show["name"]
            if data["page"] == data["total_pages"]:
                break
            params["page"] += 1

    with open("shows.json", "w") as file:
        dump(shows, file)
