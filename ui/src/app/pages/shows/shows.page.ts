import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";

export const db = getFirestore();

@Component({
  selector: 'app-shows',
  templateUrl: 'shows.page.html',
  styleUrls: ['shows.page.scss'],
})
export class ShowsPage implements OnInit {
  show: any;
  seasons: any[] = [];

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    const showId = this.route.snapshot.paramMap.get('id');
    if (showId) {
      const showDoc = await getDoc(doc(db, "shows", showId));
      this.show = showDoc.data();

      const seasonsCollection = collection(db, "shows", showId, "seasons");
      const seasonsSnapshot = await getDocs(seasonsCollection);
      this.seasons = seasonsSnapshot.docs.map((doc, seasonIndex) => {
        const data = doc.data();
        return {
          episodes: Array.from({ length: data['season_episodes'] }, (_, episodeIndex) => (seasonIndex + 1) * 100 + (episodeIndex + 1))
        };
      });
      
    }
  }
}
