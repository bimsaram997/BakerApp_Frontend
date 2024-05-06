import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { ComponentsModule } from '../../shared/components/components.module';
import { MatRippleModule } from '@angular/material/core';
import { RawMaterialRoutingModule } from './rawMaterials-routing.module';
import { AddRawMaterialComponent } from './add-raw-material/add-raw-material.component';
import { RawMaterialListComponent } from './raw-material-list/raw-material-list.component';





@NgModule({
  declarations: [
    AddRawMaterialComponent,
    RawMaterialListComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ComponentsModule,
    MatRippleModule,
    RawMaterialRoutingModule
  ]
})
export class RawMaterialModule { }
