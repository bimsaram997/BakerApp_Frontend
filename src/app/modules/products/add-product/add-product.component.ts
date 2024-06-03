import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, concatAll } from 'rxjs';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from 'src/app/models/enum_collection/toolbar-button';
import { FoodTypeService } from '../../../services/bakery/food-type.service';
import { FoodType } from '../../../models/Products/foodType';
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
@Component({
  selector: 'app-add-food-item',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit, OnDestroy {
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
  units: any[] = [
    { Id: 0, name: 'PCS' },
    { Id: 1, name: 'HRS' },
  ];
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
    private recipeService: RecipeService
  ) {}
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.mode = params['mode'];
      const id: number = +params['id'];
      if (id !== null) {
        this.productId = id;
      }
    });
    this.createFormGroup();

    this.toolbarService.updateCustomButtons([
      ToolbarButtonType.Save,
      ToolbarButtonType.SaveClose,
      ToolbarButtonType.Cancel,
    ]);
    this.getListSimpleRecipes();
    if (this.mode === 'edit') {
      this.isEdit = true;
      this.header = 'Update product';
      this.getProductById(this.productId);
    } else {
      this.header = 'Add product';
    }
    this.toolbarService.updateToolbarContent(this.header);
    // this.toolbarService.subscribeToButtonClick((buttonType: ToolbarButtonType) => {
    //   this.handleButtonClick(buttonType);
    // });

    this.setValidators();
  }

  handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.Save:
        this.isEdit ? this.updateItem() : this.addProduct();
        this.saveCloseValue = false;
        break;
      case ToolbarButtonType.Update:
        //this.handleUpdateButton();
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
  }

  public getListSimpleRecipes(): void {
    this.subscription.push(
      this.recipeService
        .listSimpleRecipes()
        .subscribe((recipe: RecipeListSimpleVM[]) => {
          this.recipes = recipe;
        })
    );
  }

  public getProductById(productId: number): void {
    if (productId > 0) {
      this.subscription.push(
        this.productService
          .getProductById(productId)
          .subscribe((foodItem: ProductVM) => {
            this.setValuestoForm(foodItem);
          })
      );
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
      });
    }
    this.imagePreview = foodItem.ImageURL;
    this.costPrice.setValue(foodItem.CostPrice);
    this.sellingPrice.setValue(foodItem.SellingPrice);
  }

  openDialog(): void {
    if (this.isEdit) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '500px', // Set the width as per your requirement
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
        };
        const updateResponse = this.productService.addProduct(addProduct);
        this.subscription.push(
          updateResponse.subscribe((res: any) => {
            if (res != null) {
              this.toolbarService.enableButtons(true);
              this.toastr.success('Success!', 'Product added!');
              this.getProductById(res);
            }
          })
        );
        // Now you can do something with the addProduct object, such as sending it to a service
        if (this.saveCloseValue) {
          this.saveClose();
        }
      } catch (error) {
        this.toolbarService.enableButtons(true);
        console.error('An error occurred while updating the food item:', error);
        this.toastr.error('Error!', 'Failed to update food item.');
      }
    }
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

        const updateResponse = this.productService.updateProductById(
          this.productId,
          this.updateProduct
        );
        this.subscription.push(
          updateResponse.subscribe((res: any) => {
            console.log(res);
            if (res != null) {
              this.toolbarService.enableButtons(true);
              this.toastr.success('Success!', 'Product updated!');
              this.getProductById(res);
            }
          })
        );
      } catch (error) {
        this.toolbarService.enableButtons(true);
        console.error('An error occurred while updating the food item:', error);
        this.toastr.error('Error!', 'Failed to update food item.');
      }
    }
  }

  setValidators(): void {
    if (!this.isEdit) {
      // this.productCount.setValidators([Validators.required, CustomValidators.nonNegative()]);
    } else {
      //this.productCount.clearValidators();
      //  this.productCount.updateValueAndValidity();
    }
  }

  saveClose(): void {
    this.router.navigate(['base/product/product']);
  }
  triggerFileInput() {
    // Trigger a click on the file input when the button is clicked
    this.fileInput.nativeElement.click();
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
