import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { LoginComponent } from './login/login.component';
import { MainheaderComponent } from './mainheader/mainheader.component';
import { SidenavbarComponent } from './sidenavbar/sidenavbar.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { AddressLookupComponent } from './address-lookup/address-lookup.component';
import { InfoBoxComponent } from './info-box/info-box.component';
import { CustomAutocompleteComponent } from './custom-autocomplete/custom-autocomplete.component';
import { ProductSearchComponent } from './product-search/product-search.component';




@NgModule({
  declarations: [
    LoginComponent,
    MainheaderComponent,
    SidenavbarComponent,
    ToolBarComponent,
    ConfirmDialogComponent,
    AddressLookupComponent,
    InfoBoxComponent,
    CustomAutocompleteComponent,
    ProductSearchComponent,

  ],
  entryComponents: [ConfirmDialogComponent, InfoBoxComponent, ProductSearchComponent],
  imports: [
    CommonModule,
    MaterialModule

  ],
  exports: [MainheaderComponent,
    SidenavbarComponent, ToolBarComponent, AddressLookupComponent, CustomAutocompleteComponent],
})
export class ComponentsModule { }
