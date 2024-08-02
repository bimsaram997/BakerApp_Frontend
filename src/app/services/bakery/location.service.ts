import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
import { AddLocationRequest, LocationAdvanceFilter, UpdateLocation } from '../../models/Location/location';
@Injectable({
  providedIn: 'root'
})
export class LocationService {

  @Injectable({
    providedIn: 'root',
  })
  myUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}
  public getLocationData(filter: LocationAdvanceFilter): Observable<any> {
    return this.http.post(`${this.myUrl}/Location/listAdvance`, filter);
  }

  public addLocation(addLocationData: AddLocationRequest): Observable<any> {
    return this.http.post(`${this.myUrl}/Location/addLocation`, addLocationData);
  }
  public updateLocationById(locationId: number, updateItem: UpdateLocation): Observable<any> {
    return this.http.put(`${this.myUrl}/Location/updateLocation/${locationId}`, updateItem)
  }

  public getLocationById(id: number): Observable<any> {
    return this.http.get(`${this.myUrl}/Location/getLocationById/${id}`);
  }

  public locationListSimple(): Observable<any> {
    return this.http.get(`${this.myUrl}/Location/listSimpleLocations`);
  }
}

