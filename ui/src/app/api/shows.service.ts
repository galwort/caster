import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShowsService {

  private apiUrl = 'http://127.0.0.1:5000/shows';

  constructor(private http: HttpClient) { }

  getShows(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
