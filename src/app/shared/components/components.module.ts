import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { LoginComponent } from './login/login.component';
import { MainheaderComponent } from './mainheader/mainheader.component';
import { SidenavbarComponent } from './sidenavbar/sidenavbar.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';




@NgModule({
  declarations: [
    LoginComponent,
    MainheaderComponent,
    SidenavbarComponent,
    ToolBarComponent,
    ConfirmDialogComponent
  ],
  entryComponents: [ConfirmDialogComponent],
  imports: [
    CommonModule,
    MaterialModule

  ],
  exports: [MainheaderComponent,
    SidenavbarComponent, ToolBarComponent],
})
export class ComponentsModule { }
