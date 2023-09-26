import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  public profilePicUrl: string;
  public showPosters: { imageUrl: string; id: string }[] = [];

  constructor(private authService: AuthService) { }

  async ngOnInit() {
    this.authService.userPic.subscribe(url => {
      this.profilePicUrl = url;
    });

    try {
      const db = getFirestore();
      const userUid = await this.authService.getCurrentUserId();

      const userRankingsQuery = query(
        collection(db, 'user_rankings'),
        where('user_uid', '==', userUid)
      );
      const userRankingsSnapshot = await getDocs(userRankingsQuery);
      
      const userShowIds = userRankingsSnapshot.docs.map(doc => doc.data()['show_id']);

      const showsSnapshot = await getDocs(collection(db, 'shows'));
      this.showPosters = showsSnapshot.docs
        .filter(doc => userShowIds.includes(doc.id))
        .map(doc => {
          const data = doc.data();
          return {
            imageUrl: 'https://image.tmdb.org/t/p/w500' + data['show_image'],
            id: doc.id
          };
        });
    } catch (e) {
      console.error('Failed to fetch user-ranked show images:', e);
    }
  }
}
