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
  public username = new BehaviorSubject<string>('Guest');

  constructor(private auth: Auth) {
    const savedPic = localStorage.getItem('profilePic');
    const savedUsername = localStorage.getItem('username');
    
    if (savedPic) {
      this.userPic.next(savedPic);
    }

    if (savedUsername) {
      this.username.next(savedUsername);
    }

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userId.next(user.uid);
      } else {
        this.userId.next(null);
        localStorage.removeItem('profilePic');
      }
    });
  }

  login({ email, password }: LoginData) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async loginWithGoogle() {
    const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
    const photoURL = result.user.photoURL;
    const username = result.user.displayName;

    if (photoURL) {
      this.userPic.next(photoURL);
      localStorage.setItem('profilePic', photoURL);
    }

    if (username) {
      this.username.next(username);
      localStorage.setItem('username', username);
    }
  }

  register({ email, password }: LoginData) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    this.userPic.next('assets/profile.svg');
    localStorage.removeItem('profilePic');
    return signOut(this.auth);
  }
  
  getCurrentUserId(): string | null {
    return this.userId.value;
  }
}