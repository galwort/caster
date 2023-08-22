import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  isHomePage: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isHomePage = event.urlAfterRedirects === '/home';
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
