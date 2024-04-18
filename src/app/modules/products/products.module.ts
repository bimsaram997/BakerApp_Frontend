import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AddFoodItemComponent } from './add-food-item/add-food-item.component';
import { FoodListComponent } from './food-list/food-list.component';
import { ProductRoutingModule } from './products-routing.module';
import { MaterialModule } from '../../material.module';
import { ComponentsModule } from '../../shared/components/components.module';
import { NotifierModule } from 'angular-notifier';
import { ToastrModule } from 'ngx-toastr';
import { MatRippleModule } from '@angular/material/core';




@NgModule({
  declarations: [
     AddFoodItemComponent,
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
