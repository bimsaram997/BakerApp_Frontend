import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, Subscription } from 'rxjs';
import { AllMasterData, MasterDataVM } from 'src/app/models/MasterData/MasterData';
import { AddResultVM, ResultView } from 'src/app/models/ResultView';
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
import { AddStock } from 'src/app/models/Stock/Stock';
import { StockServiceService } from '../../../services/bakery/stock-service.service';
import { S } from '@angular/cdk/keycodes';
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
  recipeId: number;
  minExpiryDate = null;
  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private router: Router,
    private masterDataService: MasterDataService,
    private toastr: ToastrService,
    private productService: ProductService,
    private recipeService: RecipeService,
    private supplierService: SupplierService,
    private stockServiceService: StockServiceService
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
    this. disableSpecificFields();
    this.setMinExpiryDate();
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
      // if(this.stockGroup.controls['supplierFirstName'].value == null) {
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
      unit: [null,  Validators.required],
      costCode: [null, Validators.required],
      recipeName:[null, [Validators.required]],
      rawMaterials: [null, [Validators.required]],
      supplyingType: [null, [Validators.required]],
      supplierId: [null],
      manufactureDate: [null, [Validators.required]],
      expiryDate: [null, [Validators.required]],
      addedDate: [null, [Validators.required]],
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

  disableSpecificFields(): void {
    this.stockGroup.controls['unit'].disable();
    this.stockGroup.controls['costCode'].disable();
    this.stockGroup.controls['recipeName'].disable();
    this.stockGroup.controls['rawMaterials'].disable();
    this.stockGroup.controls['unit'].disable();
    this.stockGroup.controls['supplyingType'].disable();
    this.stockGroup.controls['supplierId'].disable();
    this.stockGroup.controls['manufactureDate'].disable();
    this.stockGroup.controls['addedDate'].disable();
    this.stockGroup.controls['expiryDate'].disable();
    this.costPrice.disable();
    this.sellingPrice.disable();
    this.itemCount.disable();
    this.reorderLevel.disable();
  }

  addStock(): void {
    Object.values(this.stockGroup.controls).forEach((control) => {
      control.markAsTouched();
    });

    if (
      this.stockGroup.valid
    ) {
      try {
        this.toolbarService.enableButtons(false);
        const formData = this.stockGroup.value;


        const addStock: AddStock = {
          ProductId:  formData.product,
          Unit: formData.unit,
          CostCode: formData.costCode,
          SellingPrice: this.sellingPrice.value,
          CostPrice: this.costPrice.value,
          RecipeId: this.recipeId,
          SupplyTypeId: formData.supplyingType,
          SupplierId: formData.supplierId,
          ManufacturedDate: formData.manufactureDate,
          ExpiredDate: formData.expiryDate,
          ItemQuantity: this.itemCount.value,
          ReorderLevel: this.reorderLevel.value,
          AddedDate: formData.addedDate,

        };
        const updateResponse = this.stockServiceService.addStock(addStock);
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
           //    this.getSupplierById(res.Id);
                this.supplierId = res.Id
                if (this.saveCloseValue) {
                // this.saveClose();
                } else {
                  this.router.navigate([
                    'base/supplier/add',
                    'view',
                    this.supplierId,
                  ]);
                  this.header = 'View supplier';
                  this.toolbarService.updateToolbarContent(this.header);
                //  this.disableFormGroup();
                //  this.removeSpecificButtons();
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

  checkProductAssociatedWithStock(prodId: number): void {

    try {
      const resultResponse = this.stockServiceService.getProductId(prodId)
      this.subscription.push(
        resultResponse
          .pipe(
            catchError((error) => {
              this.resetForm();
              this.recipeId = null;
              this.toastr.error('Error!', error.error.Message);

              return error;
            })
          )
          .subscribe((res: AddResultVM) => {
            if (res.Id == 0) {
              this.getProductById(prodId);
            }else {
              this.toastr.error('Error!', 'Product is associated with stock. Please selct new product.');
            }
          })
      );
    } catch (error) {
     this.resetForm();
    this.recipeId = null;
      console.error('An error occurred while attempting to load recipes:', error);
    }


  }



  selectProduct(value: MatSelectChange): void {
    this.recipeId = null;
    this.productId = value.value;
    this. disableSpecificFields();
    this.checkProductAssociatedWithStock(this.productId);
  }

  enableSpecificFields(): void {
    this.stockGroup.controls['supplyingType'].enable();
    this.stockGroup.controls['supplierId'].enable();
    this.stockGroup.controls['manufactureDate'].enable();
    this.stockGroup.controls['addedDate'].enable();
    this.stockGroup.controls['expiryDate'].enable();
    this.itemCount.enable();
    this.reorderLevel.enable();
  }

  selectSupplierType(value: MatSelectChange): void {
     const Id = value.value;
     this.stockGroup.controls['supplierId'].setValue(null);
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
      if(supplierFilter.ProductIds.length > 0) {
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
      }


    }catch (error) {

      console.error('An error occurred while retrieving the suppliers:', error);
      this.toastr.error('Error!', 'Failed to retriev the supplier.');
    }

  }

  public getProductById(productId: number): void {
    if (productId > 0) {
      try {

          this.enableSpecificFields();

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
             this.sellingPrice.setValue(product.Item.SellingPrice);
             this.costPrice.setValue(product.Item.CostPrice);

             //get recipe details and bind
             this.recipeId = product.Item.RecipeId;
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
              this.toastr.error('Error!', error.message);
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
              this.toastr.error('Error!', error.message);
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
              this.toastr.error('Error!', error.message);
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
    this.stockGroup.reset();
    this.supplierList = [];
    this.stockGroup.controls['supplyingType'].setValue(null);
    this.stockGroup.controls['supplierId'].setValue(null);
    this.sellingPrice.setValue(null);
    this.costPrice.setValue(null);
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
       this.isEdit ? this.updateItem() : this.addStock();
        this.saveCloseValue = false;
        break;
      case ToolbarButtonType.Edit:
     // this.handleEditButton();
        break;
      case ToolbarButtonType.SaveClose:
        this.saveCloseValue = true;
        this.isEdit ? this.updateItem() : this.addStock();
        break;
      case ToolbarButtonType.Cancel:
        this.saveClose();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }

  setMinExpiryDate() {

    this.subscription.push( this.stockGroup.controls['manufactureDate'].valueChanges.subscribe(value => {
      const manufactureDate = value;
      if (manufactureDate) {
        this.minExpiryDate = new Date(manufactureDate);
        this.minExpiryDate.setDate(this.minExpiryDate.getDate() + 1);
      } else {
        this.minExpiryDate = null;
      }
    }));

  }

  minExpiryDateFilter = (d: Date | null): boolean => {
    if (!this.minExpiryDate) {
      return true;
    }
    return d > this.minExpiryDate;
  }

  updateItem() {
    throw new Error('Method not implemented.');
  }

  saveClose(): void {
    this.router.navigate(['base/stock/stock']);
  }
}
