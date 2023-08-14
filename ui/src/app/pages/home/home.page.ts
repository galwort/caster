import { Component } from '@angular/core';
import { ShowsService } from '../../api/shows.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  shows: string[] = [];
  filteredShows: string[] = [];

  constructor(private showsService: ShowsService) {
    this.loadShows();
  }

  loadShows() {
    this.showsService.getShows().subscribe(data => {
      this.shows = Object.values(data);
      this.filteredShows = [...this.shows];
    });
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredShows = this.shows.filter(show => show.toLowerCase().includes(query));
  }
}
