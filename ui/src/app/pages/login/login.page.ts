import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LoginData } from 'src/app/interfaces/login-data.interface';
import { Router } from '@angular/router';
import { getFirestore, collection, getDocs } from "firebase/firestore";

interface ShowPoster {
  imageUrl: string;
  id: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginData: LoginData = { email: '', password: '' };
  showPosters: ShowPoster[] = [];


  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  async ngOnInit() {
    try {
      const db = getFirestore();
      const showsCollection = collection(db, "shows");
      const showsSnapshot = await getDocs(showsCollection);
      this.showPosters = showsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          imageUrl: 'https://image.tmdb.org/t/p/w500' + data['show_image'],
          id: doc.id
        };
      });
    } catch (e) {
      console.error('Failed to fetch show images:', e);
    }
  }

  goToShowPage(showId: string) {
    this.router.navigate(['/shows', showId]);
  }

  login() {
    this.authService
      .login(this.loginData)
      .then(() => this.router.navigate(['/home']))
      .catch((e) => console.error('Login failed:', e.message));
  }

  loginWithGoogle() {
    this.authService
      .loginWithGoogle()
      .then(() => this.router.navigate(['/home']))
      .catch((e) => console.error('Google login failed:', e.message));
  }
}
