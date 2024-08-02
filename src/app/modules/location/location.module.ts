import { CommonModule } from "@angular/common";
import { MatRippleModule } from "@angular/material/core";
import { NgModule } from "@angular/core";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { MaterialModule } from "src/app/material.module";
import { LocationRoutingModule } from "./location-routing.module";
import { LocationListComponent } from "./location-list/location-list.component";
import { AddLocationComponent } from './add-location/add-location.component';

@NgModule({
  declarations: [

    LocationListComponent,
    AddLocationComponent

  ],
  imports: [
    CommonModule,
    LocationRoutingModule,
    MaterialModule,
    ComponentsModule,
    MatRippleModule
  ]
})
export class LocationModule { }
