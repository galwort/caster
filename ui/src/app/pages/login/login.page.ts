import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';
import { LoginData } from 'src/app/interfaces/login-data.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {}

  login(loginData: LoginData) {
    this.authService
      .login(loginData)
      .then(() => this.router.navigate(['/home']))
      .catch((e) => console.log(e.message));
  }
}