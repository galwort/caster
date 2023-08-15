import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shows',
  templateUrl: 'shows.page.html',
  styleUrls: ['shows.page.scss'],
})
export class ShowsPage implements OnInit {
  showId!: string | null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.showId = this.route.snapshot.paramMap.get('id');
    if (this.showId === null) {
    } else {
    }
  }
}
