import {
  Auth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

import { Injectable } from '@angular/core';
import { LoginData } from '../interfaces/login-data.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public userPic = new BehaviorSubject<string>('assets/profile.svg');
  public userId = new BehaviorSubject<string | null>(null); 

  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userId.next(user.uid);
      } else {
        this.userId.next(null);
      }
    });
  }

  login({ email, password }: LoginData) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider())
      .then((result) => {
        const photoURL = result.user.photoURL;
        if (photoURL) {
          this.userPic.next(photoURL);
        }
      });
  }

  register({ email, password }: LoginData) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    this.userPic.next('assets/profile.svg');
    return signOut(this.auth);
  }
  
  getCurrentUserId(): string | null {
    return this.userId.value;
  }
}