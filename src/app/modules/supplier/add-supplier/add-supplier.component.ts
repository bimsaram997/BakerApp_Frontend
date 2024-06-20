import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, Observable, startWith, Subject, Subscription } from 'rxjs';
import { ToolbarButtonType } from 'src/app/models/enum_collection/toolbar-button';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import { ToastrService } from 'ngx-toastr';
import { RawMaterialListSimpleVM } from 'src/app/models/RawMaterials/RawMaterial';
import { RawMaterialService } from '../../../services/bakery/raw-material.service';
import { AddResultVM, ResultView } from 'src/app/models/ResultView';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import {
  AutoCompleteType,
  SearchItemType,
} from 'src/app/models/enum_collection/enumType';
import { AutoCompleteResult } from 'src/app/models/shared/menu';
import { ProductService } from 'src/app/services/bakery/product.service';
import { ProductListSimpleVM } from 'src/app/models/Products/product';
import { AddSupplierRquest, SupplierVM, UpdateSupplier } from 'src/app/models/Supplier/Supplier'
import { AddressRequest } from 'src/app/models/Address/Address';
import { SupplierService } from 'src/app/services/bakery/supplier.service';
@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
  styleUrls: ['./add-supplier.component.css'],
})
export class AddSupplierComponent implements OnInit, OnDestroy {
  @ViewChild('productInput') productInput: ElementRef<HTMLInputElement>;
  @ViewChild('rawMaterialInput') rawMaterialInput: ElementRef<HTMLInputElement>;
  toolBarButtons: ToolbarButtonType[];
  subscription: Subscription[] = [];
  header: string;
  mode: string;
  supplierId: number;
  supplierGroup: FormGroup;
  isEdit: boolean = false;
  @ViewChild('fileInput') fileInput: ElementRef;
  imagePreview: string = 'assets/main images/placeholder.png';
  saveCloseValue: boolean = false;
  isView: boolean;
  allRawMaterials: RawMaterialListSimpleVM[];
  allProdcuts: ProductListSimpleVM[];
  public SearchItemType = SearchItemType;
  isProduct: boolean =  false;

  productSearchCtrl = new FormControl();
  rawMaterialSearchCtrl = new FormControl();
  staticProductList: ProductListSimpleVM[];
  staticRawterials: RawMaterialListSimpleVM[];
  isRawMaterial: boolean = true;
  addrressId: number;
  updateSupplier:UpdateSupplier = new UpdateSupplier();

  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private masterDataService: MasterDataService,
    private rawMaterialService: RawMaterialService,
    private productService: ProductService,
    private supplierService: SupplierService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.mode = params['mode'];
      const id: number = +params['id'];
      if (id !== null) {
        this.supplierId = id;
      }
    });
    this.getListRawMaterials();
    this.getListProducts();
    this.createFormGroup();
    if (this.mode === 'view') {
      this.toolBarButtons = [ToolbarButtonType.Edit, ToolbarButtonType.Cancel];
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
      this.isView = true;
      this.header = 'View supplier';
      this.toolbarService.updateToolbarContent(this.header);
      this.getSupplierById(this.supplierId);
    } else if (this.mode === 'edit') {
      this.header = 'Edit supplier';
      this.isEdit = true;
      this.toolbarService.updateToolbarContent(this.header);
      this.toolBarButtons = [
        ToolbarButtonType.Save,
        ToolbarButtonType.SaveClose,
        ToolbarButtonType.Cancel,
      ];
      if(this.supplierGroup.controls['supplierFirstName'].value == null) {
        this.getSupplierById(this.supplierId)
      }
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
    } else {
      this.header = 'Add supplier';
      this.toolbarService.updateToolbarContent(this.header);
      this.toolBarButtons = [
        ToolbarButtonType.Save,
        ToolbarButtonType.SaveClose,
        ToolbarButtonType.Cancel,
      ];
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
    }
    this.toolbarService.updateToolbarContent(this.header);
    this.subscription.push(
      this.productSearchCtrl.valueChanges.subscribe((value: any) => {
        if (value != '') {
          this._filterItems(value, SearchItemType.Product);
        }
      })
    );
    this.subscription.push(
      this.rawMaterialSearchCtrl.valueChanges.subscribe((value: any) => {
        if (value != '') {
          this._filterItems(value, SearchItemType.RawMaterial);
        }
      })
    );
  }

  getSupplierById(id: number): void {
    if (id > 0) {
      try {
        const resultResponse = this.supplierService.getSupplierById(id);
        this.subscription.push(
          resultResponse
            .pipe(
              catchError((error) => {
                this.toastr.error('Error!', error.error.Message);
                return error;
              })
            )
            .subscribe((supplier: ResultView<SupplierVM>) => {
              if (supplier != null) {
               this.setValuestoForm(supplier.Item);
              }
            })
        );
      } catch (error) {
        console.error('An error occurred while attempting to load recipes:', error);
      }
    }
  }

  setValuestoForm(supplier: SupplierVM): void {
    if (supplier != null) {
      this.supplierGroup.controls['supplierFirstName'].setValue(supplier.SupplierFirstName);
      this.supplierGroup.controls['supplierLastName'].setValue(supplier.SupplierLastName);
      this.supplierGroup.controls['productIds'].setValue(supplier.ProductIds);
      this.supplierGroup.controls['phoneNumber'].setValue(supplier.PhoneNumber);
      this.supplierGroup.controls['rawMaterialIds'].setValue(supplier.RawMaterialIds);
      this.supplierGroup.controls['email'].setValue(supplier.Email);
      this.supplierGroup.controls['addedDate'].setValue(supplier.AddedDate);
      this.addrressId = supplier.AddressId;
      this.addressForm.setValue({
        street1: supplier.Address.Street1,
        street2: supplier.Address.Street2,
        city: supplier.Address.City,
        country: supplier.Address.Country,
        postalCode: supplier.Address.PostalCode,
      });
      if(supplier.IsProduct) {
        this.isProduct = true;
      this.isRawMaterial = false;
        this.supplierGroup.controls['supplierItemType'].setValue(true);
      } else if (supplier.IsRawMaterial) {
        this.supplierGroup.controls['supplierItemType'].setValue(false);
        this.isProduct = false;
      this.isRawMaterial = true;
      }
    }
    if (this.isView) {
      this.disableFormGroup();
    }
  }


  getRawMaterialIdList($event: AutoCompleteResult): void {
    const test = $event;
  }

  getListRawMaterials(): void {
    this.rawMaterialService
      .listSimpleRawmaterials()
      .subscribe((res: ResultView<RawMaterialListSimpleVM[]>) => {
        this.allRawMaterials = res.Item;
        this.staticRawterials = this.allRawMaterials;
      });
  }

  getListProducts(): void {
    this.productService
      .listSimpleProducts()
      .subscribe((res: ResultView<ProductListSimpleVM[]>) => {
        this.allProdcuts = res.Item;
        this.staticProductList = this.allProdcuts;
      });
  }

  createFormGroup(): void {
    this.supplierGroup = this.fb.group({
      supplierItemType: [false, Validators.required],
      supplierFirstName: [null, Validators.required],
      supplierLastName: [null, Validators.required],
      addedDate: [null, Validators.required],
      phoneNumber: [null, [Validators.required, Validators.minLength(10)]],
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
      productIds: [null],
      rawMaterialIds: [null],
    });
  }

  get addressForm() {
    return this.supplierGroup.get('address') as FormGroup;
  }

  addSupplier(): void {
    Object.values(this.supplierGroup.controls).forEach((control) => {
      control.markAsTouched();
    });

    if (
      this.supplierGroup.valid
    ) {
      try {
        this.toolbarService.enableButtons(false);
        const formData = this.supplierGroup.value;
        const address: AddressRequest = new AddressRequest();
        address.City = formData.address.city;
        address.Street1 = formData.address.street1;
        address.Street2 = formData.address.street2;
        address.Country = formData.address.country;
        address.PostalCode = formData.address.postalCode;
        const addSupplier: AddSupplierRquest = {
          IsProduct:  this.isProduct,
          IsRawMaterial: this.isRawMaterial,
          SupplierFirstName: formData.supplierFirstName,
          SupplierLastName: formData.supplierLastName,
          AddedDate: formData.addedDate,
          PhoneNumber: formData.phoneNumber,
          Email: formData.email,
          ProductIds: formData.productIds,
          RawMaterialIds: formData.rawMaterialIds,
          Address: address,
        };
        const updateResponse = this.supplierService.addSupplier(addSupplier);
        this.subscription.push(
          updateResponse
            .pipe(
              catchError((error) => {
                this.toastr.error('Error!', error.error.Message);
                this.toolbarService.enableButtons(true);
                return error;
              })
            )
            .subscribe((res: AddResultVM) => {
              if (res != null) {
                this.toolbarService.enableButtons(true);
                this.toastr.success('Success!', 'Supplier added!');
               this.getSupplierById(res.Id);
                this.supplierId = res.Id
                if (this.saveCloseValue) {
                 this.saveClose();
                } else {
                  this.router.navigate([
                    'base/supplier/add',
                    'view',
                    this.supplierId,
                  ]);
                  this.header = 'View supplier';
                  this.toolbarService.updateToolbarContent(this.header);
                 this.disableFormGroup();
                 this.removeSpecificButtons();
                }
              }
            })
        );

      } catch (error) {
        this.toolbarService.enableButtons(true);
        console.error('An error occurred while adding the product:', error);
        this.toastr.error('Error!', 'Failed to add the product.');
      }
    }
  }

  updateItem(): void {
    Object.values(this.supplierGroup.controls).forEach((control) => {
      control.markAsTouched();
    });

    if (
      this.supplierGroup.valid
    ) {
      try {
        this.toolbarService.enableButtons(false);
        const formData = this.supplierGroup.controls['address'].value;
        const address: AddressRequest = new AddressRequest();
        address.City = formData.city;
        address.Street1 = formData.street1;
        address.Street2 = formData.street2;
        address.Country = formData.country;
        address.PostalCode = formData.postalCode;
        this.updateSupplier.SupplierFirstName  =  this.supplierGroup.controls['supplierFirstName'].value;
        this.updateSupplier.SupplierLastName  =  this.supplierGroup.controls['supplierLastName'].value;
        this.updateSupplier.Email  =  this.supplierGroup.controls['email'].value;
        this.updateSupplier.PhoneNumber  =  this.supplierGroup.controls['phoneNumber'].value;
        this.updateSupplier.IsProduct  =  this.isProduct;
        this.updateSupplier.IsRawMaterial  =  this.isRawMaterial;
        this.updateSupplier.ProductIds  =  this.supplierGroup.controls['productIds'].value;
        this.updateSupplier.RawMaterialIds  =  this.supplierGroup.controls['rawMaterialIds'].value;
        this.updateSupplier.AddressId =  this.addrressId;
        this.updateSupplier.Address = address;
        const updateResponse = this.supplierService.updateSupplierById(this.supplierId, this.updateSupplier);
        this.subscription.push(
          updateResponse
            .pipe(
              catchError((error) => {
                this.toastr.error('Error!', error.error.Message);
                this.toolbarService.enableButtons(true);
                return error;
              })
            )
            .subscribe((res: AddResultVM) => {
              if (res != null) {
                this.toolbarService.enableButtons(true);
                this.toastr.success('Success!', 'Supplier updated!');
               this.getSupplierById(res.Id);
                this.supplierId = res.Id
                if (this.saveCloseValue) {
                 this.saveClose();
                } else {
                  this.router.navigate([
                    'base/supplier/add',
                    'view',
                    this.supplierId,
                  ]);
                  this.header = 'View supplier';
                  this.toolbarService.updateToolbarContent(this.header);
                 this.disableFormGroup();
                 this.removeSpecificButtons();
                }
              }
            })
        );

      } catch (error) {
        this.toolbarService.enableButtons(true);
        console.error('An error occurred while adding the product:', error);
        this.toastr.error('Error!', 'Failed to add the product.');
      }
    }
  }

  selectValue($event: any): void {
    const isSelect = $event.value;
    if (isSelect) {
      this.isProduct = true;
      this.isRawMaterial = false;
      this.supplierGroup.controls['rawMaterialIds'].setValue(null);
      this.supplierGroup.controls["productIds"].addValidators([Validators.required]);
      this.supplierGroup.controls['productIds'].updateValueAndValidity();

      this.supplierGroup.controls["rawMaterialIds"].clearValidators();
      this.supplierGroup.controls['rawMaterialIds'].updateValueAndValidity();
    } else {
      this.isProduct = false;
      this.isRawMaterial = true;
      this.supplierGroup.controls['productIds'].setValue(null);
      this.supplierGroup.controls["rawMaterialIds"].addValidators([Validators.required]);
      this.supplierGroup.controls['rawMaterialIds'].updateValueAndValidity();

      this.supplierGroup.controls["productIds"].clearValidators();
      this.supplierGroup.controls['productIds'].updateValueAndValidity();
    }
  }



  saveClose(): void {
    this.router.navigate(['base/supplier/supplier']);
  }

  onInputValueChanged(searchItemType: SearchItemType) {
    switch (searchItemType) {
      case SearchItemType.Product:
        if (
          this.productSearchCtrl &&
          this.productInput.nativeElement.value.trim() === ''
        ) {
          this.allProdcuts = this.staticProductList;
        }
        break;
      case SearchItemType.RawMaterial:
        if (
          this.rawMaterialSearchCtrl &&
          this.rawMaterialInput.nativeElement.value.trim() === ''
        ) {
          this.allRawMaterials = this.staticRawterials;
        }
        break;
    }
  }

  private _filterItems(value: string, searchItemType: SearchItemType): void {
    switch (searchItemType) {
      case SearchItemType.Product:
        if (value !== null) {
          const filterValue = value;
          const test = this.allProdcuts.filter((product) =>
            product.Name.includes(filterValue)
          );
          if (test) {
            this.allProdcuts = test;
          }
        }
        break;
      case SearchItemType.RawMaterial:
        if (value !== null) {
          const filterValue = value;
          const test = this.allRawMaterials.filter((rawMaterial) =>
            rawMaterial.Name.includes(filterValue)
          );
          if (test) {
            this.allRawMaterials = test;
          }
        }
    }

  }

  handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.Save:
        this.isEdit ? this.updateItem() : this.addSupplier();
        this.saveCloseValue = false;
        break;
      case ToolbarButtonType.Edit:
      this.handleEditButton();
        break;
      case ToolbarButtonType.SaveClose:
        this.saveCloseValue = true;
        this.isEdit ? this.updateItem() : this.addSupplier();
        break;
      case ToolbarButtonType.Cancel:
        this.saveClose();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }

  disableFormGroup(): void {
    this.toolBarButtons = [ToolbarButtonType.Edit, ToolbarButtonType.Cancel];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
    this.supplierGroup.disable();
    this.cd.detectChanges();
  }

  enableFormGroup(): void {
    this.header = 'Edit recipe';
    this.toolbarService.updateToolbarContent(this.header);
    this.supplierGroup.enable();
    this.cd.detectChanges();
  }

  removeSpecificButtons(): void {
    const deleteIndex = this.toolBarButtons.indexOf(ToolbarButtonType.Save);
    if (deleteIndex !== -1) {
      this.toolBarButtons.splice(deleteIndex, 1);
    }
    const editIndex = this.toolBarButtons.indexOf(ToolbarButtonType.SaveClose);
    if (editIndex !== -1) {
      this.toolBarButtons.splice(editIndex, 1);
    }
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
  }

  handleEditButton(): void {
    this.isView = false;
    this.isEdit = true;
    this.enableFormGroup();
    this.router.navigate(['base/supplier/add', 'edit', this.supplierId]);
    const deleteIndex = this.toolBarButtons.indexOf(ToolbarButtonType.Edit);
    if (deleteIndex !== -1) {
      this.toolBarButtons.splice(deleteIndex, 1);
    }
    this.toolBarButtons = [ToolbarButtonType.Save, ToolbarButtonType.SaveClose];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
  }


  ngOnDestroy(): void {
    this.toolbarService.updateCustomButtons([]);
    this.toolbarService.updateToolbarContent('');

    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.toolbarService.unsubscribeAll();
  }
}
