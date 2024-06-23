import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { ComponentsModule } from '../../shared/components/components.module';
import { MatRippleModule } from '@angular/material/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { StockRoutingModule } from './stock-routing.module';
import { StockListComponent } from './stock-list/stock-list.component';
import { AddStockComponent } from './add-stock/add-stock.component';




@NgModule({
  declarations: [
    StockListComponent,
    AddStockComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ComponentsModule,
    MatRippleModule,
    CKEditorModule,
    StockRoutingModule
  ]
})
export class StockModule { }
