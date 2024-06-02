import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MaterialModule } from '../../material.module';
import { ComponentsModule } from '../../shared/components/components.module';
import { UserRoutingModule } from './user-routing.module';
import { ToolBarComponent } from 'src/app/shared/components/tool-bar/tool-bar.component';
import { UserListComponent } from './user-list/user-list.component';
import { AddUserComponent } from './add-user/add-user.component';






@NgModule({
  declarations: [
    UserListComponent,
    AddUserComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ComponentsModule,
    MatRippleModule,
    UserRoutingModule,
    // NgxMaskDirective, NgxMaskPipe
  ],

})
export class UserModule { }
