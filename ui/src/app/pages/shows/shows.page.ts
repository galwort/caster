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
  selectedSeason: any = null;
  selectedEpisode: number | null = null;
  castCharacters: { image: string; name: string; order: number }[] = [];
  rankCharacters: { image: string; name: string }[] = [];
  bankCharacters: { image: string; name: string }[] = [];

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
          label: `Season ${seasonIndex + 1}`,
          episodes: Array.from({ length: data['season_episodes'] }, (_, episodeIndex) => episodeIndex + 1)
        };
      });
    }
  }

  onSeasonSelect(event: any) {
    this.selectedSeason = this.seasons.find(season => season.label === event.detail.value);
    this.selectedEpisode = null; 
  }

  onEpisodeSelect(event: any) {
    this.selectedEpisode = event.detail.value;
    this.loadCastImages();
  }

  async loadCastImages() {
    if (!this.selectedSeason || this.selectedEpisode === null) return;

    const seasonIndex = this.seasons.indexOf(this.selectedSeason);
    const episodeIndex = this.selectedEpisode;

    this.castCharacters = [];

    const showId = this.route.snapshot.paramMap.get('id');
    if (showId) {
      const episodeCollection = collection(db, "shows", showId, "seasons", (seasonIndex + 1).toString(), "episodes", episodeIndex.toString(), "cast");
      const episodeSnapshot = await getDocs(episodeCollection);
      this.castCharacters = episodeSnapshot.docs.map(doc => {
        const data = doc.data();
        const character = data['cast_character'];
        return {
          image: data['cast_image'],
          name: character.startsWith('Self') ? data['cast_name'] : character,
          order: data['cast_order']
        };
      });
      this.rankCharacters = this.castCharacters.slice(0, 6);
      this.bankCharacters = this.castCharacters.slice(6);
    }
  }

  drop(event: CdkDragDrop<{ image: string; name: string; order: number;}[]>): void {
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
