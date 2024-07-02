import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddStock } from 'src/app/models/Stock/Stock';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockServiceService {

  myUrl = environment.baseUrl;


  constructor(private http: HttpClient) {
    //this.currntUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    // this.currentUser = this.currntUserSubject.asObservable() test
  }

  // public getRecipes(filter: RecipeListAdvanceFilter): Observable<any> {

  //   return this.http.post(`${this.myUrl}/Recipe/listAdvance`, filter);
  // }

  // public getRecipeById(id: number): Observable<any> {
  //   return this.http.get(`${this.myUrl}/Recipe/getRecipeById/${id}`);
  // }

  // public updateRecipeById(recipeId: number, updateItem: UpdateRecipe): Observable<any> {
  //   return this.http.put(`${this.myUrl}/Recipe/updateRecipe/${recipeId}`, updateItem)
  // }

  public addStock( addStock: AddStock): Observable<any> {
    return this.http.post(`${this.myUrl}/Stock/addStock`, addStock );
}
public getProductId(prodId: number): Observable<any> {

    return this.http.get(`${this.myUrl}/Stock/getProductId/${prodId}`);
  }
}
