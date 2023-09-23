import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  public profilePicUrl: string;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.userPic.subscribe(url => {
      this.profilePicUrl = url;
    });
  }
}
