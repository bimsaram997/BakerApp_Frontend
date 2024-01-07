import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeDashboardComponent } from './home-dashboard.component';
import { HomeDashbaordRoutingModule } from './home-dashboard-routing';
import { MaterialModule } from '../../../material.module';



@NgModule({
  declarations: [
    HomeDashboardComponent
  ],
  imports: [
    CommonModule,
    HomeDashbaordRoutingModule,
    MaterialModule
  ]
})
export class HomeDashboardModule { }
