  import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
  import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragMove, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
  import { ViewportRuler } from '@angular/cdk/scrolling';
  import { AuthService } from '../../services/auth.service';
  import { query, orderBy, limit, startAfter } from "firebase/firestore";
  import { Router } from '@angular/router';



  export const db = getFirestore();

  @Component({
    selector: 'app-shows',
    templateUrl: 'shows.page.html',
    styleUrls: ['shows.page.scss'],
  })
  export class ShowsPage implements OnInit {
    nextShow: any = null;
    prevShow: any = null;
    userId: string | null = null;
    show: any;
    seasons: any[] = [];
    castImages: string[] = [];
    selectedSeason: any = null;
    selectedEpisode: number | null = null;
    castCharacters: { image: string; name: string; order: number }[] = [];
    rankCharacters: { image: string; name: string; order: number }[] = [];
    bankCharacters: { image: string; name: string; order: number }[] = [];
    public target: CdkDropList<any> | null = null;
    public targetIndex: number;
    public source: CdkDropList<any> | null = null;
    public sourceIndex: number;
    public dragIndex: number;
    public activeContainer: any;


    constructor(
      private viewportRuler: ViewportRuler,
      private route: ActivatedRoute,
      private cdr: ChangeDetectorRef,
      private authService: AuthService,
      private router: Router
    ) {
        this.target = null;
        this.source = null;
    }
    

    @ViewChild('episodeSelect') episodeSelect: any;
    @ViewChild(CdkDropListGroup) listGroup: CdkDropListGroup<CdkDropList>;
    @ViewChild(CdkDropList) placeholder: CdkDropList;

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

        await this.loadCastImages();
        await this.loadAdjacentShows(showId);
      }
    }

    async loadAdjacentShows(currentShowId: string) {
      const currentShowDoc = await getDoc(doc(db, "shows", currentShowId));
      const currentShowData = currentShowDoc.data() || {};

      const currentShowName = currentShowData['show_name'];

      const nextQuery = query(
        collection(db, "shows"),
        orderBy("show_name"),
        startAfter(currentShowName),
        limit(1)
      );
  
      const nextSnapshot = await getDocs(nextQuery);
      this.nextShow = nextSnapshot.docs.length ? nextSnapshot.docs[0].id : null;
  
      const prevQuery = query(
        collection(db, "shows"),
        orderBy("show_name", "desc"),
        startAfter(currentShowName),
        limit(1)
      );
  
      const prevSnapshot = await getDocs(prevQuery);
      this.prevShow = prevSnapshot.docs.length ? prevSnapshot.docs[0].id : null;
    }

    navigateToNextShow() {
      if (this.nextShow) {
        this.router.navigate(['/shows', this.nextShow]);
      }
    }
    
    navigateToPrevShow() {
      if (this.prevShow) {
        this.router.navigate(['/shows', this.prevShow]);
      }
    }

    onSeasonSelect(event: any) {
      this.selectedSeason = this.seasons.find(season => season.label === event.detail.value);
      this.selectedEpisode = null;
      this.loadCastImages();
      
      if (this.episodeSelect) {
        this.episodeSelect.value = null;
      }
    }
    

    onEpisodeSelect(event: any) {
      this.selectedEpisode = event.detail.value;
      this.loadCastImages();
    }

    async loadCastImages() {
      const showId = this.route.snapshot.paramMap.get('id');
      if (!showId) return;
    
      let castCollection;
    
      if (this.selectedEpisode !== null) {
        const seasonIndex = this.seasons.indexOf(this.selectedSeason);
        const episodeIndex = this.selectedEpisode;
        castCollection = collection(db, "shows", showId, "seasons", (seasonIndex + 1).toString(), "episodes", episodeIndex.toString(), "cast");
      } else if (this.selectedSeason) {
        const seasonIndex = this.seasons.indexOf(this.selectedSeason);
        castCollection = collection(db, "shows", showId, "seasons", (seasonIndex + 1).toString(), "cast");
      } else {
        castCollection = collection(db, "shows", showId, "cast");
      }
    
      const castSnapshot = await getDocs(castCollection);
      this.castCharacters = castSnapshot.docs.map(doc => {
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

    async saveRanking() {
      const userId = this.authService.getCurrentUserId();
      console.log(userId);
    }
  }
