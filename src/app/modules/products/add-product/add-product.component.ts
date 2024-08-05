import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, catchError, concatAll } from 'rxjs';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from 'src/app/models/enum_collection/toolbar-button';
import { FoodTypeService } from '../../../services/bakery/food-type.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../../services/bakery/product.service';
import {
  AddProduct,
  AddProductRequest,
  ProductVM,
  RecipeListSimpleVM,
  UpdateProduct,
} from '../../../models/Products/product';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from '../../../shared/utils/custom-validators';
import { RecipeService } from '../../../services/bakery/reipe.service';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import {
  AllMasterData,
  MasterDataVM,
} from '../../../models/MasterData/MasterData';
import { EnumType } from '../../../models/enum_collection/enumType';
import { AddResultVM, ResultView } from 'src/app/models/ResultView';

@Component({
  selector: 'app-add-food-item',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit, OnDestroy {
  toolBarButtons: ToolbarButtonType[];
  subscription: Subscription[] = [];
  header: string;
  mode: string;
  productId: number;
  recipes: RecipeListSimpleVM[] = [];
  productGroup: FormGroup;
  batchId: any;
  updateProduct: UpdateProduct = new UpdateProduct();
  newProduct: AddProduct = new AddProduct();
  isEdit: boolean = false;
  @ViewChild('fileInput') fileInput: ElementRef;
  imagePreview: string = 'assets/main images/placeholder.png';
  productCount: FormControl;
  saveCloseValue: boolean = false;
  isView: boolean;
  statuses: any[] = [
    {Id: 0, Status: 'Discontinued'},
    {Id: 1, Status: 'Active'}
  ]
  costCodes: any[] = [
    {
      Id: 0,
      Costcode: 'CC001',
      Description: 'Bakery products',
    },
    {
      Id: 2,
      Costcode: 'CC002',
      Description: 'Vegetables',
    },
    {
      Id: 3,
      Costcode: 'CC003',
      Description: 'Diary products',
    },
  ];
  costPrice: FormControl;
  sellingPrice: FormControl;
  reOrderLevel: FormControl;
  weight: FormControl;
  daysToExpires: FormControl;
  units: MasterDataVM[];

  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private foodTypeService: FoodTypeService,
    private fb: FormBuilder,
    private productService: ProductService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private router: Router,
    private recipeService: RecipeService,
    private masterDataService: MasterDataService
  ) {}
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.mode = params['mode'];
      const id: number = +params['id'];
      if (id !== null) {
        this.productId = id;
      }
    });
    this.getUnits();
    this.getListSimpleRecipes();
    this.createFormGroup();
    if (this.mode === 'view') {
      this.toolBarButtons = [ToolbarButtonType.Edit, ToolbarButtonType.Cancel];
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
      this.isView = true;
      this.header = 'View product';
      this.toolbarService.updateToolbarContent(this.header);
      this.getProductById(this.productId);
    } else if (this.mode === 'edit') {
      this.header = 'Edit product';
      this.toolbarService.updateToolbarContent(this.header);
      this.toolBarButtons = [
        ToolbarButtonType.Save,
        ToolbarButtonType.SaveClose,
        ToolbarButtonType.Cancel,
      ];
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
    } else {
      this.header = 'Add product';
      this.toolbarService.updateToolbarContent(this.header);
      this.toolBarButtons = [
        ToolbarButtonType.Save,
        ToolbarButtonType.SaveClose,
        ToolbarButtonType.Cancel,
      ];
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
    }
    this.toolbarService.updateToolbarContent(this.header);
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

  handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.Save:
        this.isEdit ? this.updateItem() : this.addProduct();
        this.saveCloseValue = false;
        break;
      case ToolbarButtonType.Edit:
        this.handleEditButton();
        break;
      case ToolbarButtonType.SaveClose:
        this.saveCloseValue = true;
        this.isEdit ? this.updateItem() : this.addProduct();
        break;
      case ToolbarButtonType.Cancel:
        this.saveClose();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }

  createFormGroup(): void {
    this.productGroup = this.fb.group({
      name: [null, Validators.required],
      unit: [null, Validators.required],
      costCode: [null, Validators.required],
      recipeId: [null, Validators.required],
      productDescription: [null, Validators.required],
      imageURL: [null],
      addedDate: [null, Validators.required],
      status: [null, Validators.required]
    });
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
    this.reOrderLevel =  new FormControl(null);
    this.reOrderLevel.setValidators([
      Validators.required,
      CustomValidators.nonNegative(),
    ]);

    this.weight =  new FormControl(null);
    this.weight.setValidators([
      Validators.required,
      CustomValidators.nonNegative(),
    ]);

    this.daysToExpires =  new FormControl(null);
    this.daysToExpires.setValidators([
      Validators.required,
      CustomValidators.nonNegative(),
    ]);
  }

  public getListSimpleRecipes(): void {
    this.subscription.push(
      this.recipeService
        .listSimpleRecipes()
        .subscribe((res: ResultView<RecipeListSimpleVM[]>) => {
          this.recipes = res.Item;
        })
    );
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
          .subscribe((recipe: ResultView<ProductVM>) => {
            if (recipe != null) {
              this.setValuestoForm(recipe.Item);
            }
          })
      );
      } catch (error) {
        console.error('An error occurred while attempting to log in:', error);
      }

    }
  }

  setValuestoForm(foodItem: ProductVM): void {
    if (foodItem != null) {
      this.productGroup.setValue({
        name: foodItem.Name,
        unit: foodItem.Unit,
        recipeId: foodItem.RecipeId,
        addedDate: foodItem.AddedDate,
        productDescription: foodItem.ProductDescription,
        costCode: foodItem.CostCode,
        imageURL: foodItem.ImageURL,
        status: foodItem.Status ?? 1
      });
    }
    this.imagePreview = foodItem.ImageURL;
    this.costPrice.setValue(foodItem.CostPrice);
    this.sellingPrice.setValue(foodItem.SellingPrice);
    this.reOrderLevel.setValue(foodItem.ReOrderLevel ?? null);
    if(foodItem.Weight !== null) {
      this.weight.setValue(foodItem.Weight * 1000)
    } else {
      this.weight.setValue(null);
    }
    this.daysToExpires.setValue(foodItem.DaysToExpires ?? null);

    if (this.isView) {
      this.disableFormGroup();
    }
  }

  openDialog(): void {
    if (this.isEdit) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '500px',
        data: {
          title: 'Confirm Save',
          text: `You are updating a record with Batch ID ${this.batchId}. This will also update other records with the same Batch ID. Are you sure you want to proceed?`,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.updateItem();
        }
      });
    }
  }

  addProduct(): void {
    Object.values(this.productGroup.controls).forEach((control) => {
      control.markAsTouched();
    });

    if (
      this.productGroup.valid &&
      this.costPrice.valid &&
      this.sellingPrice.valid
    ) {
      try {
        this.toolbarService.enableButtons(false);
        const formData = this.productGroup.value;
        const addProduct: AddProductRequest = {
          ProductDescription: formData.productDescription,
          Name: formData.name,
          ImageURL: formData.imageURL,
          AddedDate: formData.addedDate,
          Unit: formData.unit,
          CostCode: formData.costCode,
          CostPrice: this.costPrice.value,
          SellingPrice: this.sellingPrice.value,
          RecipeId: formData.recipeId,
          ReOrderLevel: this.reOrderLevel.value,
          Weight: (this.weight.value)/1000,
          Status: formData.status,
          DaysToExpires: this.daysToExpires.value
        };
        const updateResponse = this.productService.addProduct(addProduct);
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
                this.toastr.success('Success!', 'Product added!');
                this.getProductById(res.Id);
                this.productId = res.Id
                if (this.saveCloseValue) {
                  this.saveClose();
                } else {
                  this.router.navigate([
                    'base/product/add',
                    'view',
                    this.productId,
                  ]);
                  this.header = 'View product';
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

  disableFormGroup(): void {
    this.toolBarButtons = [ToolbarButtonType.Edit, ToolbarButtonType.Cancel];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
    this.productGroup.disable();
    this.costPrice.disable();
    this.sellingPrice.disable();
    this.weight.disable();
    this.reOrderLevel.disable();
    this.daysToExpires.disable();
    this.cd.detectChanges();


  }

  enableFormGroup(): void {
    this.header = 'Edit recipe';
    this.toolbarService.updateToolbarContent(this.header);
    this.productGroup.enable();
    this.costPrice.enable();
    this.sellingPrice.enable();
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
    this.router.navigate(['base/product/add', 'edit', this.productId]);
    const deleteIndex = this.toolBarButtons.indexOf(ToolbarButtonType.Edit);
    if (deleteIndex !== -1) {
      this.toolBarButtons.splice(deleteIndex, 1);
    }
    this.toolBarButtons = [ToolbarButtonType.Save, ToolbarButtonType.SaveClose];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
  }

  updateItem(): void {
    Object.values(this.productGroup.controls).forEach((control) => {
      control.markAsTouched();
    });

    if (
      this.productGroup.valid &&
      this.costPrice.valid &&
      this.sellingPrice.valid
    ) {
      try {
        this.toolbarService.enableButtons(false);
        this.updateProduct.ImageURL =
          this.productGroup.controls['imageURL'].value;
        this.updateProduct.ProductDescription =
          this.productGroup.controls['productDescription'].value;
        this.updateProduct.Name = this.productGroup.controls['name'].value;
        this.updateProduct.Unit = this.productGroup.controls['unit'].value;
        this.updateProduct.CostCode =
          this.productGroup.controls['costCode'].value;
        this.updateProduct.RecipeId =
          this.productGroup.controls['recipeId'].value;
        this.updateProduct.SellingPrice = this.sellingPrice.value;
        this.updateProduct.CostPrice = this.costPrice.value;
        this.updateProduct.ReOrderLevel = this.reOrderLevel.value;
        this.updateProduct.Weight = (this.weight.value)/1000;
        this.updateProduct.Status = this.productGroup.controls['status'].value;
        this.updateProduct.DaysToExpires = this.daysToExpires.value;
        const updateResponse = this.productService.updateProductById(
          this.productId,
          this.updateProduct
        );
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
                this.toastr.success('Success!', 'Product updated!');
                this.getProductById(res.Id);
                if (this.saveCloseValue) {
                  this.saveClose();
                } else {
                  this.isView = true;
                  this.removeSpecificButtons();
                  this.disableFormGroup();
                  this.header = 'View product';
                  this.toolbarService.updateToolbarContent(this.header)
                }
              }
            })
        );
      } catch (error) {
        this.toolbarService.enableButtons(true);
        console.error('An error occurred while updating the product:', error);
        this.toastr.error('Error!', 'Failed to update product.');
      }
    }
  }

  saveClose(): void {
    this.router.navigate(['base/product/product']);
  }
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: any): void {
    const fileEvnet = event.target.files[0];
    const uploadData = new FormData();
    let reader = new FileReader();
    let file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        console.log(file.name);
        this.productGroup.patchValue({
          imageURL: reader.result,
        });
      };
      this.cd.markForCheck();
    }
    this.productGroup.patchValue({ imageURL: file });
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
