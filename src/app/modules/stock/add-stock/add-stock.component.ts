import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, Subscription } from 'rxjs';
import { AllMasterData, MasterDataVM } from 'src/app/models/MasterData/MasterData';
import { ResultView } from 'src/app/models/ResultView';
import { MasterDataService } from 'src/app/services/bakery/master-data.service';
import { ProductListSimpleVM, ProductVM } from '../../../models/Products/product';
import { EnumType, SearchItemType } from '../../../models/enum_collection/enumType';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { ProductService } from '../../../services/bakery/product.service';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { MatSelectChange } from '@angular/material/select';
import { RecipeService } from '../../../services/bakery/reipe.service';
import {
  AddRecipeRequest,
  RecipeRawMaterial,
  RecipeVM,
  UpdateRecipe,
} from '../../../models/Recipe/Recipe';
import { MasterDataCode } from 'src/app/models/enum_collection/masterDataCode';
import { SupplierService } from 'src/app/services/bakery/supplier.service';
import { SupplerListSimpleFilter, SupplierListSimpleVM } from 'src/app/models/Supplier/Supplier';
import { CustomValidators } from 'src/app/shared/utils/custom-validators';
@Component({
  selector: 'app-add-stock',
  templateUrl: './add-stock.component.html',
  styleUrls: ['./add-stock.component.css']
})
export class AddStockComponent {
  @ViewChild('productInput') productInput: ElementRef<HTMLInputElement>;
  @ViewChild('rawMaterialInput') rawMaterialInput: ElementRef<HTMLInputElement>;
  toolBarButtons: ToolbarButtonType[];
  subscription: Subscription[] = [];
  header: string;
  mode: string;
  supplierId: number;
  stockGroup: FormGroup;
  isEdit: boolean = false;
  @ViewChild('fileInput') fileInput: ElementRef;
  imagePreview: string = 'assets/main images/placeholder.png';
  saveCloseValue: boolean = false;
  isView: boolean;
  allProdcuts: ProductListSimpleVM[];
  public SearchItemType = SearchItemType;
  isProduct: boolean =  false;

  productSearchCtrl = new FormControl();
  rawMaterialSearchCtrl = new FormControl();
  staticProductList: ProductListSimpleVM[];
  isRawMaterial: boolean = true;
  units: MasterDataVM[];
  costCodes: MasterDataVM[];
  supplyingTypes: MasterDataVM[];
  isExternalSupplier: boolean;
  productId: any;
  supplierList: SupplierListSimpleVM[] = [];
  itemCount: FormControl;
  reorderLevel: FormControl
  costPrice: FormControl;
  sellingPrice: FormControl;

  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private router: Router,
    private masterDataService: MasterDataService,
    private toastr: ToastrService,
    private productService: ProductService,
    private recipeService: RecipeService,
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
    this.getCostCodes();
    this.getUnits();
    this.getListProducts();
    this.getSupplyingType();
    this.createFormGroup();
    if (this.mode === 'view') {
      this.toolBarButtons = [ToolbarButtonType.Edit, ToolbarButtonType.Cancel];
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
      this.isView = true;
      this.header = 'View stock';
      this.toolbarService.updateToolbarContent(this.header);
     // this.getSupplierById(this.supplierId);
    } else if (this.mode === 'edit') {
      this.header = 'Edit stock';
      this.isEdit = true;
      this.toolbarService.updateToolbarContent(this.header);
      this.toolBarButtons = [
        ToolbarButtonType.Save,
        ToolbarButtonType.SaveClose,
        ToolbarButtonType.Cancel,
      ];
      // if(this.supplierGroup.controls['supplierFirstName'].value == null) {
      //   this.getSupplierById(this.supplierId)
      // }
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
    } else {
      this.header = 'Add stock';
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

  createFormGroup(): void {
    this.stockGroup = this.fb.group({
      product: [null, Validators.required],
      unit: [null, Validators.required],
      costCode: [null, Validators.required],
      sellingPrice: [null, Validators.required],
      costPrice: [null, [Validators.required, Validators.minLength(10)]],
      recipeName:[null, [Validators.required]],
      rawMaterials: [null, [Validators.required]],
      supplyingType: [null, [Validators.required]],
      supplierId: [null, [Validators.required]],
      manufactureDate: [null, [Validators.required]],
      expiryDate: [null, [Validators.required]],

    });
    this.itemCount = new FormControl(null);
    this.itemCount.setValidators([
      Validators.required,
      CustomValidators.nonNegative(),
    ]);

    this.reorderLevel = new FormControl(null);
    this.reorderLevel.setValidators([
      Validators.required,
      CustomValidators.nonNegative(),
    ]);

    this.sellingPrice = new FormControl(null);
    this.sellingPrice.setValidators([
      Validators.required,
      CustomValidators.nonNegative(),
    ]);

    this.costPrice = new FormControl(null);
    this.costPrice.setValidators([
      Validators.required,
      CustomValidators.nonNegative(),
    ]);
  }

  selectProduct(value: MatSelectChange): void {
    this.productId = value.value;
    this.resetForm();
    this.getProductById(this.productId);
  }

  selectSupplierType(value: MatSelectChange): void {
     const Id = value.value;
     const supplierCode  = this.supplyingTypes.find((suppliertype: MasterDataVM) => suppliertype.Id === Id).MasterValueCode;
     switch (supplierCode) {
      case MasterDataCode.InHouse:
        this.isExternalSupplier = false;
        break;
      case MasterDataCode.ExternalSupply:
        this.isExternalSupplier = true ;
        this.getSuppliers();
     }
  }

  getSuppliers(): void  {
    const supplierFilter: SupplerListSimpleFilter = {
      IsProduct:true,
      IsRawMaterial: false,
      ProductIds: [this.productId]
    }

    try {
      const updateResponse = this.supplierService.getSupplierListSimple(supplierFilter);
      this.subscription.push(
        updateResponse
          .pipe(
            catchError((error) => {
              this.toastr.error('Error!', error.error.Message);

              return error;
            })
          )
          .subscribe((res: ResultView<SupplierListSimpleVM[]>) => {
            if (res != null) {
              this.supplierList =  res.Item;
            }
          })
      );
    }catch (error) {

      console.error('An error occurred while retrieving the suppliers:', error);
      this.toastr.error('Error!', 'Failed to retriev the supplier.');
    }

  }

  public getProductById(productId: number): void {
    if (productId > 0) {
      try {
      const resultResponse = this.productService.getProductById(productId);
      this.subscription.push(
        resultResponse
          .pipe(
            catchError((error) => {
              this.toastr.error('Error!', error.error.Message);
              return error;
            })
          )
          .subscribe((product: ResultView<ProductVM>) => {
            if (product != null) {
             this.stockGroup.controls['unit'].setValue(product.Item.Unit);
             this.stockGroup.controls['costCode'].setValue(product.Item.CostCode);
             this.stockGroup.controls['sellingPrice'].setValue(product.Item.SellingPrice);
             this.stockGroup.controls['costPrice'].setValue(product.Item.CostPrice);

             //get recipe details and bind
             this.getRecipeById(product.Item.RecipeId);
            }
          })
      );
      } catch (error) {
        console.error('An error occurred while attempting to log in:', error);
      }

    }
  }

  getRecipeById(id: number): void {
    if (id > 0) {
      try {
        const resultResponse = this.recipeService.getRecipeById(id);
        this.subscription.push(
          resultResponse
            .pipe(
              catchError((error) => {
                this.toastr.error('Error!', error.error.Message);
                return error;
              })
            )
            .subscribe((recipe: ResultView<RecipeVM>) => {
              if (recipe != null) {
                this.stockGroup.controls['recipeName'].setValue(recipe.Item.RecipeName);
                const rawMaterialNames = recipe.Item.RawMaterials.map(material => material.rawMaterialName).join(', ')
                this.stockGroup.controls['rawMaterials'].setValue(rawMaterialNames);
              }
            })
        );
      } catch (error) {
        console.error('An error occurred while attempting to load recipes:', error);
      }
    }
  }

  public getUnits(): void {
    try {
      const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(EnumType.ItemUnit);
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
              this.units = res.Item.Items;
            }
          })
      );
    } catch (error) {
      console.error('An error occurred while attempting to load master data:', error);
    }

  }

  public getCostCodes(): void {
    try {
      const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(EnumType.CostCodes);
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
              this.costCodes = res.Item.Items;
            }
          })
      );
    } catch (error) {
      console.error('An error occurred while attempting to load master data:', error);
    }

  }

  public getSupplyingType(): void {
    try {
      const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(EnumType.SupplyingType);
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
              this.supplyingTypes = res.Item.Items;
            }
          })
      );
    } catch (error) {
      console.error('An error occurred while attempting to load master data:', error);
    }

  }

  resetForm(): void {
    this.supplierList = [];
    this.stockGroup.controls['supplyingType'].setValue(null);
    this.stockGroup.controls['supplierId'].setValue(null);
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
    }
  }

  getListProducts(): void {
    this.productService
      .listSimpleProducts()
      .subscribe((res: ResultView<ProductListSimpleVM[]>) => {
        this.allProdcuts = res.Item;
        this.staticProductList = this.allProdcuts;
      });
  }

  handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.Save:
      //  this.isEdit ? this.updateItem() : this.addSupplier();
        this.saveCloseValue = false;
        break;
      case ToolbarButtonType.Edit:
     // this.handleEditButton();
        break;
      case ToolbarButtonType.SaveClose:
        this.saveCloseValue = true;
     //   this.isEdit ? this.updateItem() : this.addSupplier();
        break;
      case ToolbarButtonType.Cancel:
      //  this.saveClose();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }
}
