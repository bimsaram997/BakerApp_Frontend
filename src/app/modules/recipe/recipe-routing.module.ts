import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { AddRecipeComponent } from './add-recipe/add-recipe.component';




const routes: Routes = [
  { path: 'recipe', component: RecipeListComponent},
  { path: 'add/:mode/:id', component: AddRecipeComponent },
  { path: 'add/:mode', component: AddRecipeComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecipeRoutingModule { }
