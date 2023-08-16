import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, doc, getDoc } from "firebase/firestore";

export const db = getFirestore();

@Component({
  selector: 'app-shows',
  templateUrl: 'shows.page.html',
  styleUrls: ['shows.page.scss'],
})
export class ShowsPage implements OnInit {
  show: any;

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    const showId = this.route.snapshot.paramMap.get('id');
    if (showId) {
      const showDoc = await getDoc(doc(db, "shows", showId));
      this.show = showDoc.data();
    } else {
    }
  }
  
}
