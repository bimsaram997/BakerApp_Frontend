import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductListAdvanceFilter } from '../../models/FoodItems/productListAdvanceFilter';
import { UpdateFoodItem } from '../../models/FoodItems/foodItem';


@Injectable({
  providedIn: 'root'
})
export class FoodItemsService {

  myUrl = environment.baseUrl;


  constructor(private http: HttpClient) {
    //this.currntUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    // this.currentUser = this.currntUserSubject.asObservable()
  }

  public getFoodItems(filter: ProductListAdvanceFilter): Observable<any> {

    return this.http.post(`${this.myUrl}/FoodItem/listAdvance`, filter);
  }

  public getFoodItemById(id: number): Observable<any> {
    return this.http.get(`${this.myUrl}/FoodItem/getFoodItemId/${id}`);
  }

  public updateItemsByBatchId(batchId: number, updateItem: UpdateFoodItem): Observable<any> {
    return this.http.post(`${this.myUrl}/FoodItem/updateItemsByBatchId/${batchId}`, updateItem)
  }
}
