import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  isCollapsed = true;
  menuId = 'main-menu';

  constructor(private menuCtrl: MenuController) {}

  ngOnInit() {
    this.menuCtrl.enable(true, this.menuId);
    this.menuCtrl.open(this.menuId);
  }

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }
}
