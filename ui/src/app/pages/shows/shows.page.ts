  import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import { addDoc, getFirestore, doc, getDoc, collection, getDocs, setDoc, Timestamp } from "firebase/firestore";
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
    castCharacters: { id: string; image: string; name: string; order: number }[] = [];
    rankCharacters: { id: string; image: string; name: string; order: number }[] = [];
    bankCharacters: { id: string; image: string; name: string; order: number }[] = [];
    isBankVisible: boolean = false;
    public target: CdkDropList<any> | null = null;
    public targetIndex: number;
    public source: CdkDropList<any> | null = null;
    public sourceIndex: number;
    public dragIndex: number;
    public activeContainer: any;

    clickSound: HTMLAudioElement;
    clackSound: HTMLAudioElement;
    castSound: HTMLAudioElement;


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
    @ViewChild('bankList') bankList: CdkDropList;
    @ViewChild('castList') castList: CdkDropList;

    async ngOnInit() {
      this.clickSound = new Audio('../assets/sounds/click.wav');
      this.clackSound = new Audio('../assets/sounds/clack.wav');
      this.castSound = new Audio('../assets/sounds/cast.wav');

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
      if (nextSnapshot.docs.length) {
        this.nextShow = nextSnapshot.docs[0].id;
      } else {
        const firstQuery = query(
          collection(db, "shows"),
          orderBy("show_name"),
          limit(1)
        );
        const firstSnapshot = await getDocs(firstQuery);
        this.nextShow = firstSnapshot.docs.length ? firstSnapshot.docs[0].id : null;
      }
  
      const prevQuery = query(
        collection(db, "shows"),
        orderBy("show_name", "desc"),
        startAfter(currentShowName),
        limit(1)
      );
  
      const prevSnapshot = await getDocs(prevQuery);
      if (prevSnapshot.docs.length) {
        this.prevShow = prevSnapshot.docs[0].id;
      } else {
        const lastQuery = query(
          collection(db, "shows"),
          orderBy("show_name", "desc"),
          limit(1)
        );
        const lastSnapshot = await getDocs(lastQuery);
        this.prevShow = lastSnapshot.docs.length ? lastSnapshot.docs[0].id : null;
      }
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
          id: doc.id,
          image: data['cast_image'],
          name: (!character || character.startsWith('Self')) ? data['cast_name'] : character,
          order: data['cast_order']
        };
      });
    
      this.rankCharacters = this.castCharacters.slice(0, 6);
      this.bankCharacters = this.castCharacters.slice(6);
    }
    

    drop(event: CdkDragDrop<{ id: string, image: string; name: string; order: number;}[]>): void {
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
      const showId = this.route.snapshot.paramMap.get('id');

      const userRankingRef = doc(collection(db, 'user_rankings'));
      await setDoc(userRankingRef, {
        user_uid: userId,
        show_id: showId,
        timestamp: Timestamp.now(),
      });

      const castRankingsCollection = collection(userRankingRef, 'cast_rankings');
    
      for (let i = 0; i < this.rankCharacters.length; i++) {
        const castMember = this.rankCharacters[i];
        const order = i + 1;
        const castRankingDocRef = doc(castRankingsCollection, order.toString());
        await setDoc(castRankingDocRef, {
          cast_id: castMember.id,
          cast_name: castMember.name,
          cast_image: castMember.image,
        });
      }
    }
    
    toggleBankVisibility() {
      this.isBankVisible = !this.isBankVisible;
    }

    showOverlay() {
      const overlay = document.getElementById('overlay');
    
      if (overlay) {
        overlay.style.display = 'block';
    
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 1000);
      }
    }

    playCastSound() {
      this.castSound.play();
    }
    
    playClickSound() {
      this.clickSound.play();
    }
    
    playClackSound() {
      this.clackSound.play();
    }
  }