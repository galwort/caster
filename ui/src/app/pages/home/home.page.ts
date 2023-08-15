import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  searchResults: Observable<any[]>;
  searchTerm: string = '';

  constructor(private http: HttpClient) {}

  searchShows() {
    const query = encodeURIComponent(this.searchTerm.trim());
    const url = `https://api.themoviedb.org/3/search/tv?api_key=YOUR_API_KEY&query=${query}`;

    this.searchResults = this.http.get<any>(url)
      .pipe(
        debounceTime(200),
        map(response => response.results.slice(0, 5)) // Limit to 5 results
      );
  }
}
