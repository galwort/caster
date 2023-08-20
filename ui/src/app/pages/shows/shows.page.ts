import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

export const db = getFirestore();

@Component({
  selector: 'app-shows',
  templateUrl: 'shows.page.html',
  styleUrls: ['shows.page.scss'],
})
export class ShowsPage implements OnInit {
  show: any;
  seasons: any[] = [];
  castImages: string[] = [];
  selectedEpisode: { seasonIndex: number; episodeIndex: number } | null = null;
  castCharacters: { image: string; name: string }[] = [];

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

  async loadCastImages(seasonIndex: number, episodeIndex: number) {
    this.selectedEpisode = { seasonIndex, episodeIndex };
    const showId = this.route.snapshot.paramMap.get('id');
    if (showId) {
      const episodeCollection = collection(db, "shows", showId, "seasons", (seasonIndex + 1).toString(), "episodes", (episodeIndex + 1).toString(), "cast");
      const episodeSnapshot = await getDocs(episodeCollection);
      this.castCharacters = episodeSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          image: data['cast_image'],
          name: data['cast_character']
        };
      });
      console.log(this.castCharacters);
    }
  }

  drop(event: CdkDragDrop<{ image: string; name: string; }[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}
