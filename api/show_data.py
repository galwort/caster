import requests
from dotenv import load_dotenv
from os import getenv

load_dotenv()
api_key = getenv("TMDB_API_KEY")
url = f"https://api.themoviedb.org/3/tv/popular?api_key={api_key}&language=en-US&page=1"

response = requests.get(url)

if response.status_code == 200:
    tv_shows = response.json()["results"]
    for show in tv_shows:
        print(show["name"], show["overview"])
else:
    print("Error fetching data")
