import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ShowsPageRoutingModule } from './shows-routing.module';
import { ShowsPage } from './shows.page';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowsPageRoutingModule,
    DragDropModule
  ],
  declarations: [ShowsPage]
})
export class ShowsPageModule {}
