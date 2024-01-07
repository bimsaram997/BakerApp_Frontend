import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AddFoodItemComponent } from './add-food-item/add-food-item.component';
import { FoodListComponent } from './food-list/food-list.component';
import { ProductRoutingModule } from './products-routing.module';



@NgModule({
  declarations: [
     AddFoodItemComponent,
     FoodListComponent
  ],
  imports: [
    CommonModule,
    ProductRoutingModule
  ]
})
export class ProductsModule { }
