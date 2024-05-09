import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { ComponentsModule } from '../../shared/components/components.module';
import { MatRippleModule } from '@angular/material/core';
import { RecipeRoutingModule } from './recipe-routing.module';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { AddRecipeComponent } from './add-recipe/add-recipe.component';





@NgModule({
  declarations: [
    RecipeListComponent,
    AddRecipeComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ComponentsModule,
    MatRippleModule,
    RecipeRoutingModule,


  ]
})
export class RecipeModule { }
