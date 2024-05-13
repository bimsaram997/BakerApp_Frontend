import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AddProductComponent } from './add-food-item/add-product.component';
import { FoodListComponent } from './food-list/food-list.component';
import { ProductRoutingModule } from './products-routing.module';
import { MaterialModule } from '../../material.module';
import { ComponentsModule } from '../../shared/components/components.module';


import { MatRippleModule } from '@angular/material/core';


//test

@NgModule({
  declarations: [
     AddProductComponent,
     FoodListComponent
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
