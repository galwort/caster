import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { environment } from 'src/environments/environment';

export const app = initializeApp(environment.firebase);
export const db = getFirestore(app);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  searchResults: Observable<any[]> = of([]);
  searchTerm: string = '';
  showProgressBar = false;
  progress = 0;
  totalCalls = 0;
  completedCalls = 0;

  constructor(private http: HttpClient, private router: Router) {}

  searchShows() {
    const query = encodeURIComponent(this.searchTerm.trim());
    const url = `http://localhost:8000/search/tv?language=en-US&query=${query}`;
    this.searchResults = this.http.get<any>(url)
      .pipe(
        debounceTime(200),
        map(response => response.results.slice(0, 5))
      );
  }
  selectShow(show: any) {
    const showId = show.id.toString();
    const showDocRef = doc(db, "shows", showId);
  
    getDoc(showDocRef).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        this.router.navigate(['/shows', showId]);
      } else {
        this.showProgressBar = true;
        const url = `http://localhost:8000/tv/${showId}`;
        this.http.get<any>(url).subscribe(response => {
          const showData = {
            show_name: response.name,
            show_image: response.poster_path,
            show_first_air_date: response.first_air_date,
            show_last_air_date: response.last_air_date,
            show_seasons: response.number_of_seasons,
            show_episodes: response.number_of_episodes,
            show_overview: response.overview,
          };
          this.totalCalls = response.number_of_episodes;
          setDoc(doc(db, "shows", showId as string), showData).then(() => {
            const showCastUrl = `http://localhost:8000/tv/${showId}/credits`;
            this.http.get<any>(showCastUrl).subscribe(showCastResponse => {
              showCastResponse.cast.slice(0,6).forEach((cast: any) => {
                const showCastData = {
                  cast_name: cast.name,
                  cast_image: cast.profile_path,
                  cast_character: cast.character,
                };
                const showCastDocRef = doc(db, "shows", showId as string, "cast", cast.id.toString());
                setDoc(showCastDocRef, showCastData);
              });
            });
            for (let seasonId = 1; seasonId <= response.number_of_seasons; seasonId++) {
              const seasonUrl = `http://localhost:8000/tv/${showId}/season/${seasonId}`;
              this.http.get<any>(seasonUrl).subscribe(seasonResponse => {
                const seasonData = { season_episodes: seasonResponse.episodes.length };
                const seasonDocRef = doc(db, "shows", showId as string, "seasons", seasonId.toString());
                setDoc(seasonDocRef, seasonData).then(() => {
                  for (let episodeId = 1; episodeId <= seasonResponse.episodes.length; episodeId++) {
                    const episodeUrl = `http://localhost:8000/tv/${showId}/season/${seasonId}/episode/${episodeId}`;
                    this.http.get<any>(episodeUrl).subscribe(episodeResponse => {
                      const episodeData = {
                        episode_name: episodeResponse.name,
                        episode_air_date: episodeResponse.air_date,
                        episode_overview: episodeResponse.overview,
                      };
                      const episodeDocRef = doc(db, "shows", showId as string, "seasons", seasonId.toString(), "episodes", episodeId.toString());
                      setDoc(episodeDocRef, episodeData).then(() => {
                        const castUrl = `http://localhost:8000/tv/${showId}/season/${seasonId}/episode/${episodeId}/credits`;
                        this.http.get<any>(castUrl).subscribe(castResponse => {
                          castResponse.cast.slice(0, 6).forEach((cast: any) => {
                            const castData = {
                              cast_name: cast.name,
                              cast_image: cast.profile_path,
                              cast_character: cast.character,
                            };
                            const castDocRef = doc(db, "shows", showId as string, "seasons", seasonId.toString(), "episodes", episodeId.toString(), "cast", cast.id.toString());
                            setDoc(castDocRef, castData);
                          });
                          this.completedCalls++;
                          this.progress = (this.completedCalls / this.totalCalls) * 100;
                          if (this.completedCalls === this.totalCalls) {
                            this.router.navigate(['/shows', showId]);
                          }
                        });                        
                      });
                    });
                  }
                });
              });
            }
          });
        });
      }
    });
  }

  ionViewWillEnter() {
    this.showProgressBar = false;
    this.progress = 0;
    this.totalCalls = 0;
    this.completedCalls = 0;
    this.searchTerm = '';
    this.searchResults = of([]);
  }
}
