import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './shared/components/login/login.component';

const routes: Routes = [
  { path: '', component: LoginComponent},
  {
    path: 'base',
    loadChildren: () => import('./shared/modules/base/base.module').then(m => m.BaseModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers:[]
})
export class AppRoutingModule { }
