import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddRecipeRequest, RecipeListAdvanceFilter, UpdateRecipe } from '../../models/Recipe/Recipe';


@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  myUrl = environment.baseUrl;


  constructor(private http: HttpClient) {
    //this.currntUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    // this.currentUser = this.currntUserSubject.asObservable() test
  }

  public getRecipes(filter: RecipeListAdvanceFilter): Observable<any> {

    return this.http.post(`${this.myUrl}/Recipe/listAdvance`, filter);
  }

  public getRecipeById(id: number): Observable<any> {
    return this.http.get(`${this.myUrl}/Recipe/getRecipeById/${id}`);
  }

  public updateRecipeById(recipeId: number, updateItem: UpdateRecipe): Observable<any> {
    return this.http.put(`${this.myUrl}/Recipe/updateRecipe/${recipeId}`, updateItem)
  }

  public addRecipe( addRecipe: AddRecipeRequest): Observable<any> {
    return this.http.post(`${this.myUrl}/Recipe/addRecipe`, addRecipe );
}

public listSimpleRecipes(): Observable<any> {
  return this.http.get(`${this.myUrl}/Recipe/listSimpleRecipes`);
}
}
