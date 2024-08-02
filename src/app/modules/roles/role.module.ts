import { CommonModule } from "@angular/common";
import { MatRippleModule } from "@angular/material/core";
import { NgModule } from "@angular/core";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { MaterialModule } from "src/app/material.module";
import { RoleRoutingModule } from "./role-routing.module";
import { RoleListComponent } from "./role-list/role-list.component";
import { AddRoleComponent } from "./add-role/add-role.component";


@NgModule({
  declarations: [
    RoleListComponent,
    AddRoleComponent
  ],
  imports: [
    CommonModule,
    RoleRoutingModule,
    MaterialModule,
    ComponentsModule,
    MatRippleModule
  ]
})
export class RoleModule { }
