import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RawMaterialListComponent } from './raw-material-list/raw-material-list.component';
import { AddRawMaterialComponent } from './add-raw-material/add-raw-material.component';



const routes: Routes = [
  { path: 'rawMaterial', component: RawMaterialListComponent},
  { path: 'add/:mode/:id', component: AddRawMaterialComponent },
  { path: 'add/:mode', component: AddRawMaterialComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RawMaterialRoutingModule { }
