import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app, db } from '../../pages/home/home.page'

@Component({
  selector: 'app-loading',
  templateUrl: 'loading.page.html',
  styleUrls: ['loading.page.scss'],
})
export class LoadingPage implements OnInit {
  progress = 0;
  totalCalls = 0;
  completedCalls = 0;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const showId = this.route.snapshot.paramMap.get('id');
    const showDocRef = doc(db, "shows", showId as string);

    getDoc(showDocRef).then((docSnapshot) => {
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
    });
  }
}
