import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AddProductComponent } from './add-product/add-product.component';
import { ProductListComponent } from './product/product-list.component';
import { ProductRoutingModule } from './products-routing.module';
import { MaterialModule } from '../../material.module';
import { ComponentsModule } from '../../shared/components/components.module';


import { MatRippleModule } from '@angular/material/core';


//test

@NgModule({
  declarations: [
     AddProductComponent,
     ProductListComponent
  ],
  imports: [
    CommonModule,
    ProductRoutingModule,
    MaterialModule,
    ComponentsModule,
    MatRippleModule
  ]
})
export class ProductsModule { }
