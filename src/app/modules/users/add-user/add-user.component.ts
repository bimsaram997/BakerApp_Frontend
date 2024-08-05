import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError } from 'rxjs';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { AdduserRequest, UpdateUser } from '../../../models/User/User';
import { AddressRequest, UserDetailVM } from 'src/app/models/Address/Address';
import { LoginServiceService } from '../../../services/bakery/login-service.service';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import { EnumType } from '../../../models/enum_collection/enumType';
import { AllMasterData, MasterDataVM } from '../../../models/MasterData/MasterData';
import { RolesService } from '../../../services/bakery/roles.service';
import { MatDialog } from '@angular/material/dialog';
import { InfoBoxComponent } from 'src/app/shared/components/info-box/info-box.component';
import { AddResultVM, ResultView } from 'src/app/models/ResultView';
import { ReturnRoles, RoleListSimpleVM, RolesVM } from 'src/app/models/role/role';
import { RoleService } from 'src/app/services/bakery/role.service';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
})
export class AddUserComponent implements OnInit, OnDestroy  {
  @ViewChild('fileInput') fileInput: ElementRef;
  subscription: Subscription[] = [];
  header: string;
  mode: string;
  isEdit: boolean = false;
  saveCloseValue: boolean = false;
  userGroup: FormGroup;
  imagePreview: string = 'assets/main images/placeholder.png';
  genders: MasterDataVM[];
  countries: any[] = [
    { Id: 0, name: 'Sri Lanka' },
    { Id: 1, name: 'Finland' },
  ];
  lastButtonClick: string = '';
  userId: number;
  updateUserRequest: UpdateUser = new UpdateUser();
  addrressId: number;
  hide = true;
  roles: RoleListSimpleVM[];
  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private loginService: LoginServiceService,
    private masterDataService: MasterDataService,
    public dialog: MatDialog,
    private roleService: RoleService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.mode = params['mode'];
      const id: number = +params['id'];
      if (id !== null) {
        this.userId = id;
      }
    });
    this.createFormGroup();

    this.toolbarService.updateCustomButtons([
      ToolbarButtonType.Save,
      ToolbarButtonType.SaveClose,
      ToolbarButtonType.Cancel,
    ]);

    if (this.mode === 'edit') {
      this.isEdit = true;
      this.header = 'Update user';
      this.getUserId(this.userId);
      this.removeValidators();
      //this.disableFields();
    } else {
      this.header = 'Add user';
    }
    this.toolbarService.updateToolbarContent(this.header);
    this.getGenders();
    this.getRoles();
    //this.setValidators();
  }

  createFormGroup(): void {
    const passwordPattern = '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$';
    this.userGroup = this.fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      gender: [null, Validators.required],
      addedDate: [null, Validators.required],
      phoneNumber: [
        null,
        [
          Validators.required,
          Validators.minLength(10)
        ],
      ],
      email: [
        null,
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ],
      ],
      address: this.fb.group({
        street1: ['', Validators.required],
        street2: [null],
        city: [null, Validators.required],
        country: [null, Validators.required],
        postalCode: ['', [Validators.required]],
      }),
      role: [null, Validators.required],
      password: [
        null,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(passwordPattern),
        ]
      ],
      rePassword: [null, Validators.required],
      imageURL: [null, Validators.required],
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(InfoBoxComponent, {
      data: { title: "Info (Passowrd hint)", text: " Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" },
    });

    dialogRef.afterClosed().subscribe((result) => {
    });
  }


  get addressForm() {
    return this.userGroup.get('address') as FormGroup;
  }

  handleButtonClick(buttonType: ToolbarButtonType) {
    switch (buttonType) {
      case ToolbarButtonType.Save:
        this.isEdit ? this.updateUser() : this.addUser();
        this.saveCloseValue = false;
        break;
      case ToolbarButtonType.Update:
        //this.handleUpdateButton();
        break;
      case ToolbarButtonType.SaveClose:
        this.saveCloseValue = true;
        this.isEdit ? this.updateUser() : this.addUser();
        break;
      case ToolbarButtonType.Cancel:
        this.saveClose();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }

  public getGenders(): void {
    try {
      const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(EnumType.Gender);
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
              this.genders = res.Item.Items;
            }
          })
      );
    } catch (error) {
      console.error('An error occurred while attempting to load master data:', error);
    }

  }

  public getRoles(): void {
    this.subscription.push(
      this.roleService.listSimpleRoles()
        .subscribe((res: ResultView<RoleListSimpleVM[]>) => {
          this.roles = res.Item;
        })
    );
  }

  addUser() {
    Object.values(this.userGroup.controls).forEach((control) => {
      control.markAsTouched();
      Object.values(this.addressForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    });

    if (this.userGroup.valid) {
      if (
        this.userGroup.controls['password'].value !==
        this.userGroup.controls['rePassword'].value
      ) {
        this.toastr.error('Error!', 'Password mismatch');
        return;
      }
      try {
        this.toolbarService.enableButtons(false);

        const formData = this.userGroup.value;
        const address: AddressRequest = new AddressRequest();
        address.City = formData.address.city;
        address.Street1 = formData.address.street1;
        address.Street2 = formData.address.street2;
        address.Country = formData.address.country;
        address.PostalCode = formData.address.postalCode;
        const addUser: AdduserRequest = {
          FirstName: formData.firstName,
          LastName: formData.lastName,
          PhoneNumber: formData.phoneNumber,
          AddedDate: formData.addedDate,
          Gender: formData.gender,
          Email: formData.email,
          Password: formData.password,
          ImageUrl: formData.imageURL,
          Address: address,
          Role: formData.role,
        };
        console.log(addUser);
        const updateResponse = this.loginService.register(addUser);
         this.subscription.push(updateResponse.pipe(
          catchError(error => {
            this.toastr.error('Error!', error.error.Message);
            this.toolbarService.enableButtons(true);
            return error;
          })
        ).subscribe((res: AddResultVM) => {
          if (res != null) {
            this.toolbarService.enableButtons(true);
            this.toastr.success('Success!', 'User added!');
          this.getUserId(res.Id);
          }
        }));
        if (this.saveCloseValue) {
          this.saveClose();
        }
      } catch (error) {
        this.toolbarService.enableButtons(true);
        console.error('An error occurred while attempting to add user:', error.message);
      }
    } else if (this.userGroup.controls['imageURL'].value === null) {
      this.toastr.error('Error!', 'Please add profile picture');
      return;
    }
  }

  public getUserId(userId: number): void {
    if (userId > 0) {
      try {
        const resultResponse =  this.loginService.getUserId(userId);
        this.subscription.push(resultResponse.pipe(
          catchError(error => {
            this.toastr.error('Error!', error.error.Message);
            return error;
          })
        ).subscribe((user: ResultView<UserDetailVM>) => {
          if (user != null) {
            this.setValuestoForm(user.Item);
          }
        }));
      } catch (error) {
        console.error('An error occurred while attempting to retrieve:', error);
      }
    }
  }

  setValuestoForm(user: UserDetailVM): void {
    if (user != null) {
      this.userGroup.controls['firstName'].setValue(user.FirstName);
      this.userGroup.controls['lastName'].setValue(user.LastName);
      this.userGroup.controls['gender'].setValue(user.Gender);
      this.userGroup.controls['phoneNumber'].setValue(user.PhoneNumber);
      this.userGroup.controls['role'].setValue(user.Role);
      this.userGroup.controls['email'].setValue(user.Email);
      this.userGroup.controls['addedDate'].setValue(user.AddedDate);
      this.userGroup.controls['imageURL'].setValue(user.ImageUrl);
      this.addrressId = user.AddressId;
      this.addressForm.setValue({
        street1: user.Address.Street1,
        street2: user.Address.Street2,
        city: user.Address.City,
        country: user.Address.Country,
        postalCode: user.Address.PostalCode,
      });
    }
    this.imagePreview = user.ImageUrl;
  }

  removeValidators() {
    if (this.isEdit) {
      this.userGroup.get('password').clearValidators();
      this.userGroup.get('rePassword').clearValidators();
    }
  }

  updateUser(): void {
    Object.values(this.userGroup.controls).forEach((control) => {
      control.markAsTouched();
      Object.values(this.addressForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    });
    if (this.userGroup.valid) {
      try {
        this.toolbarService.enableButtons(false);
        this.updateUserRequest.ImageUrl =
          this.userGroup.controls['imageURL'].value;
        this.updateUserRequest.FirstName =
          this.userGroup.controls['firstName'].value;
        this.updateUserRequest.LastName =
          this.userGroup.controls['lastName'].value;
        this.updateUserRequest.Gender = this.userGroup.controls['gender'].value;
        this.updateUserRequest.PhoneNumber =
          this.userGroup.controls['phoneNumber'].value;
        this.updateUserRequest.Role = this.userGroup.controls['role'].value;
        this.updateUserRequest.Email = this.userGroup.controls['email'].value;
        this.updateUserRequest.AddressId = this.addrressId;
        const address: AddressRequest = new AddressRequest();
        const formData = this.userGroup.controls['address'].value;
        address.City = formData.city;
        address.Street1 = formData.street1;
        address.Street2 = formData.street2;
        address.Country = formData.country;
        address.PostalCode = formData.postalCode;
        this.updateUserRequest.Address = address;
        const updateResponse = this.loginService.updateUserById(
          this.userId,
          this.updateUserRequest
        );


        this.subscription.push(updateResponse.pipe(
          catchError(error => {
            this.toastr.error('Error!', error.error.Message);
            this.toolbarService.enableButtons(true);
            return error;
          })
        ).subscribe((res: AddResultVM) => {
          if (res != null) {
            this.toolbarService.enableButtons(true);
            this.toastr.success('Success!', 'User updated!');
          this.getUserId(res.Id);
          }
          if (this.saveCloseValue) {
            this.saveClose();
          }
        }));

      } catch (error) {
        this.toolbarService.enableButtons(true);
        console.error('An error occurred while updating user:', error);
        this.toastr.error('Error!', 'Failed to update user');
      }
    }
  }

  saveClose(): void {
    this.router.navigate(['base/user/user']);
  }

  onFileChange(event: any): void {
    const fileEvnet = event.target.files[0];
    const uploadData = new FormData();
    // uploadData.append('file', fileItem);
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        // this.imagePreview = reader.result;
        this.imagePreview = reader.result as string;
        console.log(file.name);
        this.userGroup.patchValue({
          imageURL: reader.result,
        });
      };
      this.cd.markForCheck();
    }
    this.userGroup.patchValue({ imageURL: file });
  }
  triggerFileInput() {
    // Trigger a click on the file input when the button is clicked
    this.fileInput.nativeElement.click();
  }
  ngOnDestroy(): void {
    this.toolbarService.updateCustomButtons([]);
    this.toolbarService.updateToolbarContent('');
    this.toolbarService.unsubscribeAll();
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}
