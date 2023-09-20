import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { AuthService } from './services/auth.service';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public profilePicUrl: string;
  isHomePage: boolean = false;
  isLoginPage: boolean = false;
  isLandingPage: boolean = true;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.userPic.subscribe(url => {
      this.profilePicUrl = url;
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isHomePage = event.urlAfterRedirects === '/home';
        this.isLoginPage = event.urlAfterRedirects === '/login';
        this.isLandingPage = event.urlAfterRedirects === '/' || event.urlAfterRedirects === '';
      }
    });
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToGitHub() {
    window.open('https://github.com/galwort/caster', '_blank');
  }

  login() {
    this.router.navigate(['/login']);
  }
}
