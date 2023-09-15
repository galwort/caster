import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LoginData } from 'src/app/interfaces/login-data.interface';
import { Router } from '@angular/router';
import { getFirestore, collection, getDocs } from "firebase/firestore";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerData: LoginData = { email: '', password: '' };
  showPosters: string[] = [];

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
        return 'https://image.tmdb.org/t/p/w500' + data['show_image'];
      });
    } catch (e) {
      console.error('Failed to fetch show images:', e);
    }
  } 

  register() {
    this.authService
      .register(this.registerData)
      .then(() => this.router.navigate(['/login']))
      .catch((e) => console.log(e.message));
  }
}