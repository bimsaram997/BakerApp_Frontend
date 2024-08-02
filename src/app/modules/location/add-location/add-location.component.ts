import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, Subscription } from 'rxjs';
import { AllEnumTypeVM, EnumType } from 'src/app/models/enum_collection/enumType';
import { AddLocationRequest, LocationVM, UpdateLocation } from '../../../models/Location/location';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EnumTranslationService } from 'src/app/services/bakery/enum-translation.service';
import { MasterDataService } from 'src/app/services/bakery/master-data.service';
import { ToastrService } from 'ngx-toastr';
import { AllMasterData, MasterDataVM } from 'src/app/models/MasterData/MasterData';
import { AddResultVM, ResultView } from 'src/app/models/ResultView';
import { AddressRequest } from 'src/app/models/Address/Address';
import { LocationService } from 'src/app/services/bakery/location.service';

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.css']
})
export class AddLocationComponent implements OnInit, OnDestroy{
  locationGroup: FormGroup;
  subscription: Subscription[] = [];
  enumDataList: AllEnumTypeVM[];
  isEdit: boolean = false;
  isSave: boolean = false;
  updateLocation: UpdateLocation = new UpdateLocation();
  statuses: MasterDataVM[];
  addrressId: any;
  constructor(
    public dialogRef: MatDialogRef<AddLocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private enumTranslationService: EnumTranslationService,
    private masterDataService: MasterDataService,
    private toastr: ToastrService,
    private locationService: LocationService,
  ) {}
  ngOnInit() {
    this.createFormGroup();
    this.getStatuses();
    if (this.data.edit && this.data.id != null) {
      this.isEdit = this.data.edit;
       this.getLocationById(+this.data.id);
    }
  }

  createFormGroup(): void {
    this.locationGroup = this.fb.group({
      locationName: [null, Validators.required],
      status: [null, Validators.required],
      addedDate: [null, Validators.required],
      address: this.fb.group({
        street1: ['', Validators.required],
        street2: [null],
        city: [null, Validators.required],
        country: [null, Validators.required],
        postalCode: ['', [Validators.required]],
      }),
    });
  }

  get addressForm() {
    return this.locationGroup.get('address') as FormGroup;
  }


  public getLocationById(locationId: number): void {
    if (locationId > 0) {
      try {
        const resultResponse =  this.locationService.getLocationById(locationId);
        this.subscription.push(resultResponse.pipe(
          catchError(error => {
            this.toastr.error('Error!', error.error.Message);
            return error;
          })
        ).subscribe((location: ResultView<LocationVM>) => {
          if (location != null) {
            this.setValuestoForm(location.Item);
          }
        }));
      } catch (error) {
        console.error('An error occurred while attempting to retrieve:', error);
      }
    }
  }

  getStatuses(): void {
    try {
      const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(EnumType.Status);
      this.subscription.push(
        resultResponse
          .pipe(
            catchError((error) => {
              this.toastr.error('Error!', error.error.Message);
              return error;
            })
          )
          .subscribe((res: ResultView<AllMasterData>) => {
            if (res != null) {
              this.statuses = res.Item.Items;
            }
          })
      );
    } catch (error) {
      console.error('An error occurred while attempting to load location data:', error);
    }

  }


  setValuestoForm(locationData: LocationVM): void {
    if (locationData != null) {
      this.locationGroup.controls['locationName'].setValue(
        locationData.LocationName
      );
      this.locationGroup.controls['status'].setValue(
        locationData.Status
      );
      this.locationGroup.controls['addedDate'].setValue(locationData.AddedDate);
      this.addrressId = locationData.AddressId;
      this.addressForm.setValue({
        street1: locationData.Address.Street1,
        street2: locationData.Address.Street2,
        city: locationData.Address.City,
        country: locationData.Address.Country,
        postalCode: locationData.Address.PostalCode,
      });
    }
  }


  click(): void {
    if (this.data.edit) {
      this.updateLocationData();
    } else {
      this.addLocationData();
    }
  }

  addLocationData(): void {
    Object.values(this.locationGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
    if (this.locationGroup.valid) {
      try {
        this.isSave = true;
        const formData = this.locationGroup.value;
        const address: AddressRequest = new AddressRequest();
        address.City = formData.address.city;
        address.Street1 = formData.address.street1;
        address.Street2 = formData.address.street2;
        address.Country = formData.address.country;
        address.PostalCode = formData.address.postalCode;
        const addLocationData: AddLocationRequest = {
          LocationName: formData.locationName,
          Status: formData.status,
          AddedDate: formData.addedDate,
          Address: address,
        };

        const addReponse = this.locationService.addLocation(addLocationData);
        this.subscription.push(
          addReponse
            .pipe(
              catchError((error) => {
                this.toastr.error('Error!', error.error.Message);

                return error;
              })
            )
            .subscribe((res: AddResultVM) => {
              if (res != null) {
                this.isSave = false;
                this.toastr.success('Success!', 'Location addeed!');
                this.dialogRef.close(true);

              }
            })
        );
      } catch (error) {
        this.isSave = false;
        this.dialogRef.close(false);
        console.error('An error occurred while location  adding:', error);
        this.toastr.error('Error!', 'Failed to add location.');
      }
    }
  }

  updateLocationData(): void {
    Object.values(this.locationGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
    try {
      if (this.locationGroup.valid) {
        this.isSave = true;
        this.updateLocation.LocationName =
          this.locationGroup.controls['locationName'].value;
        this.updateLocation.Status =
          this.locationGroup.controls['status'].value;
        this.updateLocation.AddressId = this.addrressId;


          const address: AddressRequest = new AddressRequest();
          const formData = this.locationGroup.controls['address'].value;
          address.City = formData.city;
          address.Street1 = formData.street1;
          address.Street2 = formData.street2;
          address.Country = formData.country;
          address.PostalCode = formData.postalCode;
          this.updateLocation.Address = address;
          const updateResponse = this.locationService.updateLocationById(
            this.data.id, this.updateLocation
          );
          this.subscription.push(
            updateResponse
              .pipe(
                catchError((error) => {
                  this.toastr.error('Error!', error.error.Message);
                  return error;
                })
              )
              .subscribe((res: AddResultVM) => {
                if (res != null) {
                  this.toastr.success('Success!', 'Location updated!');
                  this.isSave = false;
                  this.dialogRef.close(true);
                }
              })
          );
      }
    } catch (e) {
      this.toastr.error('Error!', 'Failed to update Location');
      this.isSave = false;
      this.dialogRef.close(false);
    }
  }
  ngOnDestroy(): void {
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}
