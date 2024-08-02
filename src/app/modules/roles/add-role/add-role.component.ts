import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { catchError, Subscription } from 'rxjs';
import { AllEnumTypeVM, EnumType } from 'src/app/models/enum_collection/enumType';
import { LocationlListSimpleVM } from 'src/app/models/Location/location';
import { AllMasterData, MasterDataVM } from 'src/app/models/MasterData/MasterData';
import { AddResultVM, ResultView } from 'src/app/models/ResultView';
import { RolesVM, UpdateRole } from 'src/app/models/role/role';
import { EnumTranslationService } from 'src/app/services/bakery/enum-translation.service';
import { LocationService } from 'src/app/services/bakery/location.service';
import { MasterDataService } from 'src/app/services/bakery/master-data.service';
import { RoleService } from 'src/app/services/bakery/role.service';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.css']
})
export class AddRoleComponent implements OnInit, OnDestroy{
  roleGroup: FormGroup;
  subscription: Subscription[] = [];
  enumDataList: AllEnumTypeVM[];
  isEdit: boolean = false;
  isSave: boolean = false;
  statuses: MasterDataVM[];
  addrressId: any;
  locations: LocationlListSimpleVM[];
  updateRole: UpdateRole = new UpdateRole();
  constructor(
    public dialogRef: MatDialogRef<AddRoleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private enumTranslationService: EnumTranslationService,
    private masterDataService: MasterDataService,
    private toastr: ToastrService,
    private rolesService: RoleService,
    private locationService : LocationService
  ) {}
  ngOnInit() {
    this.createFormGroup();
    this.getStatuses();
    this.listSimpleLocations();
    if (this.data.edit && this.data.id != null) {
      this.isEdit = this.data.edit;
       this.getRoleById(+this.data.id);
    }
  }

  createFormGroup(): void {
    this.roleGroup = this.fb.group({
      roleName: [null, Validators.required],
      status: [null, Validators.required],
      addedDate: [null, Validators.required],
      locationId: [null, Validators.required],
      roleDescription: [null],

    });
  }


  public getRoleById(roleId: number): void {
    if (roleId > 0) {
      try {
        const resultResponse =  this.rolesService.getRoleById(roleId);
        this.subscription.push(resultResponse.pipe(
          catchError(error => {
            this.toastr.error('Error!', error.error.Message);
            return error;
          })
        ).subscribe((role: ResultView<RolesVM>) => {
          if (role != null) {
            this.setValuestoForm(role.Item);
          }
        }));
      } catch (error) {
        console.error('An error occurred while attempting to retrieve:', error);
      }
    }
  }

  setValuestoForm(roleData: RolesVM): void {
    if (roleData != null) {
      this.roleGroup.controls['roleName'].setValue(
        roleData.RoleName
      );
      this.roleGroup.controls['status'].setValue(
        roleData.Status
      );
      this.roleGroup.controls['addedDate'].setValue(roleData.AddedDate);
      this.roleGroup.controls['locationId'].setValue(roleData.LocationId);
      this.roleGroup.controls['roleDescription'].setValue(roleData.RoleDescription);

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
  listSimpleLocations(): void {
    try {
      const resultResponse = this.locationService.locationListSimple();
      this.subscription.push(
        resultResponse
          .pipe(
            catchError((error) => {
              this.toastr.error('Error!', error.error?.Message ?? error.message);
              return error;
            })
          )
          .subscribe((res: ResultView<LocationlListSimpleVM[]>) => {
            if (res != null) {
              this.locations = res.Item;
            }
          })
      );
    } catch (error) {
      console.error('An error occurred while attempting to load location data:', error);
    }
  }
  click(): void {
    if (this.data.edit) {
      this.updateRoleData();
    }
  }

  updateRoleData(): void {
    Object.values(this.roleGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
    try {
      if (this.roleGroup.valid) {
        this.isSave = true;
        this.updateRole.RoleName =
          this.roleGroup.controls['roleName'].value;
        this.updateRole.Status =
          this.roleGroup.controls['status'].value;
        this.updateRole.LocationId =  this.roleGroup.controls['locationId'].value;
        this.updateRole.RoleDescription =  this.roleGroup.controls['roleDescription'].value;



          const updateResponse = this.rolesService.updateRoleById(
            this.data.id, this.updateRole
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
                  this.toastr.success('Success!', 'Role updated!');
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
