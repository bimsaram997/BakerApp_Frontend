import { CommonModule } from "@angular/common";

import { MatRippleModule } from "@angular/material/core";
import { NgModule } from "@angular/core";
import { SupplierRoutingModule } from "./supplier-routing.module";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { MaterialModule } from "src/app/material.module";
import { SupplierListComponent } from "./supplier-list/supplier-list.component";
import { AddSupplierComponent } from "./add-supplier/add-supplier.component";


@NgModule({
  declarations: [
    SupplierListComponent,
    AddSupplierComponent
  ],
  imports: [
    CommonModule,
    SupplierRoutingModule,
    MaterialModule,
    ComponentsModule,
    MatRippleModule
  ]
})
export class SupplierModule { }
