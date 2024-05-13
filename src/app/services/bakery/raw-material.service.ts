import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductListAdvanceFilter } from '../../models/Products/productListAdvanceFilter';
import { AddProduct, UpdateProduct } from '../../models/Products/product';
import {
  AddRawMaterial,
  RawMaterialListAdvanceFilter,
  UpdateRawMaterial,
} from '../../models/RawMaterials/RawMaterial';

@Injectable({
  providedIn: 'root',
})
export class RawMaterialService {
  myUrl = environment.baseUrl;

  constructor(private http: HttpClient) {
    //this.currntUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    // this.currentUser = this.currntUserSubject.asObservable() test
  }

  public getRawMaterials(
    filter: RawMaterialListAdvanceFilter
  ): Observable<any> {
    return this.http.post(`${this.myUrl}/RawMaterial/listAdvance`, filter);
  }

  public getRawMaterialById(id: number): Observable<any> {
    return this.http.get(`${this.myUrl}/RawMaterial/getRawMaterialById/${id}`);
  }

  public updateRawMaterialById(
    rawMaterialId: number,
    updateItem: UpdateRawMaterial
  ): Observable<any> {
    return this.http.put(
      `${this.myUrl}/RawMaterial/updateRawMaterial/${rawMaterialId}`,
      updateItem
    );
  }

  public addRawMaterial(addRawMaterial: AddRawMaterial): Observable<any> {
    return this.http.post(
      `${this.myUrl}/RawMaterial/addRawMaterial`,
      addRawMaterial
    );
  }

  public listSimpleRawmaterials(): Observable<any> {
    return this.http.get(`${this.myUrl}/RawMaterial/listSimpleRawmaterials`);
  }
}
