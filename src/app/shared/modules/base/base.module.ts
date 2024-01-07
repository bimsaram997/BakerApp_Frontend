import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from './base.component';
import { MaterialModule } from '../../../material.module';
import { ComponentsModule } from '../../components/components.module';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from '../../../app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BaseRoutingModule } from './base-routing.module';



@NgModule({
  declarations: [
    BaseComponent
  ],
  imports: [
    HttpClientModule,
    CommonModule,
    MaterialModule,
    ComponentsModule,
    BaseRoutingModule
  ]
})
export class BaseModule { }
