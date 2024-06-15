import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductListAdvanceFilter } from '../../models/Products/productListAdvanceFilter';
import { AddProduct, AddProductRequest, UpdateProduct } from '../../models/Products/product';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  myUrl = environment.baseUrl;


  constructor(private http: HttpClient) {
    //this.currntUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    // this.currentUser = this.currntUserSubject.asObservable() test
  }
public getProducts(filter: ProductListAdvanceFilter): Observable<any> {

    return this.http.post(`${this.myUrl}/Product/listAdvance`, filter);
  }


  public getProductById(id: number): Observable<any> {
    return this.http.get(`${this.myUrl}/Product/getProudctById/${id}`);
  }

  public updateProductById(productId: number, updateItem: UpdateProduct): Observable<any> {
    return this.http.post(`${this.myUrl}/Product/updateProductsById/${productId}`, updateItem)
  }

  public addProduct( addProduct:AddProductRequest ): Observable<any> {
    return this.http.post(`${this.myUrl}/Product/addProduct`, addProduct );
}

public listSimpleProducts(): Observable<any> {
  return this.http.get(`${this.myUrl}/Product/listSimpleProducts`);
}
}
