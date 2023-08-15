import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { environment } from 'src/environments/environment';

export const app = initializeApp(environment.firebase);
export const db = getFirestore(app);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})


export class HomePage {
  searchResults: Observable<any[]> = of([]);
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  searchShows() {
    const query = encodeURIComponent(this.searchTerm.trim());
    const url = `http://localhost:8000/search/tv?language=en-US&query=${query}`;

    this.searchResults = this.http.get<any>(url)
      .pipe(
        debounceTime(200),
        map(response => response.results.slice(0, 5))
      );
  }

  selectShow(show: any) {
    const showData = {
      show_name: show.name
    };

    setDoc(doc(db, "shows", show.id.toString()), showData).then(() => {
      this.router.navigate(['/shows', show.id]);
    });
  }
  
}