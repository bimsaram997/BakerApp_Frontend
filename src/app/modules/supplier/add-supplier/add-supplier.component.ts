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
import { map, Observable, startWith, Subject, Subscription } from 'rxjs';
import { ToolbarButtonType } from 'src/app/models/enum_collection/toolbar-button';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import { ToastrService } from 'ngx-toastr';
import { RawMaterialListSimpleVM } from 'src/app/models/RawMaterials/RawMaterial';
import { RawMaterialService } from '../../../services/bakery/raw-material.service';
import { ResultView } from 'src/app/models/ResultView';
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
  productId: number;
  supplierGroup: FormGroup;
  isEdit: boolean = false;
  @ViewChild('fileInput') fileInput: ElementRef;
  imagePreview: string = 'assets/main images/placeholder.png';
  saveCloseValue: boolean = false;
  isView: boolean;
  allRawMaterials: RawMaterialListSimpleVM[];
  allProdcuts: ProductListSimpleVM[];
  public SearchItemType = SearchItemType;
  isProduct: boolean;

  productSearchCtrl = new FormControl();
  rawMaterialSearchCtrl = new FormControl();
  staticProductList: ProductListSimpleVM[];
  staticRawterials: RawMaterialListSimpleVM[];
  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private masterDataService: MasterDataService,
    private rawMaterialService: RawMaterialService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.mode = params['mode'];
      const id: number = +params['id'];
      if (id !== null) {
        this.productId = id;
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
    } else if (this.mode === 'edit') {
      this.header = 'Edit supplier';
      this.toolbarService.updateToolbarContent(this.header);
      this.toolBarButtons = [
        ToolbarButtonType.Save,
        ToolbarButtonType.SaveClose,
        ToolbarButtonType.Cancel,
      ];
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
      rawMaterialIds: [null,  [Validators.required]],
    });
  }

  selectValue($event: any): void {
    const isSelect = $event.value;
    if (isSelect) {
      this.isProduct = true;
      this.supplierGroup.controls["productIds"].addValidators([Validators.required]);
      this.supplierGroup.controls['productIds'].updateValueAndValidity();

      this.supplierGroup.controls["rawMaterialIds"].addValidators([Validators.required]);
      this.supplierGroup.controls['rawMaterialIds'].updateValueAndValidity();
    } else {
      this.isProduct = false;
      this.supplierGroup.controls["rawMaterialIds"].addValidators([Validators.required]);
      this.supplierGroup.controls['rawMaterialIds'].updateValueAndValidity();

      this.supplierGroup.controls["productIds"].addValidators([Validators.required]);
      this.supplierGroup.controls['productIds'].updateValueAndValidity();
    }
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
        //  this.isEdit ? this.updateItem() : this.addProduct();
        this.saveCloseValue = false;
        break;
      case ToolbarButtonType.Edit:
        //this.handleEditButton();
        break;
      case ToolbarButtonType.SaveClose:
        this.saveCloseValue = true;
        //  this.isEdit ? this.updateItem() : this.addProduct();
        break;
      case ToolbarButtonType.Cancel:
        //  this.saveClose();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
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
