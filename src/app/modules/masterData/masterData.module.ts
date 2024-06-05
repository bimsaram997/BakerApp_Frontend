import { CommonModule } from "@angular/common";

import { MatRippleModule } from "@angular/material/core";
import { NgModule } from "@angular/core";
import { MasterDataListComponent } from './master-data-list/master-data-list.component';
import { MasterDataRoutingModule } from "./masterData-routing.module";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { MaterialModule } from "src/app/material.module";
import { AddMasterDataComponent } from './add-master-data/add-master-data.component';

@NgModule({
  declarations: [


    MasterDataListComponent,
        AddMasterDataComponent
  ],
  imports: [
    CommonModule,
    MasterDataRoutingModule,
    MaterialModule,
    ComponentsModule,
    MatRippleModule
  ]
})
export class MasterDataModule { }
