import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LoginData } from 'src/app/interfaces/login-data.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  registerData: LoginData = { email: '', password: '' };

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit() {
  }

  register() {
    this.authService
      .register(this.registerData)
      .then(() => this.router.navigate(['/login']))
      .catch((e) => console.log(e.message));
  }
}