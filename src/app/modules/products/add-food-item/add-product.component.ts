import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, concatAll } from 'rxjs';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from 'src/app/models/enum_collection/toolbar-button';
import { FoodTypeService } from '../../../services/bakery/food-type.service';
import { FoodType } from '../../../models/Products/foodType';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/bakery/product.service';
import { AddProduct, ProductVM, UpdateProduct } from '../../../models/Products/product';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from '../../../shared/utils/custom-validators';
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
  foodTypes: FoodType[] = [];
  productGroup: FormGroup;
  batchId: any;
  updateProduct: UpdateProduct = new UpdateProduct();
  newProduct: AddProduct = new AddProduct();
  isEdit: boolean = false;
  @ViewChild('fileInput') fileInput: ElementRef;
  imagePreview: string = "assets/main images/placeholder.png";
  productCount:FormControl;
  saveCloseValue: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private foodTypeService: FoodTypeService,
    private fb: FormBuilder,
    private productService: ProductService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {
  }
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.mode = params['mode'];
      const id: number= +params['id'];
      if (id !== null) {
        this.productId  =  id;
      }
    });
    this.createFormGroup();

    this.toolbarService.updateCustomButtons([ToolbarButtonType.Save, ToolbarButtonType.SaveClose, ToolbarButtonType.Cancel ]);
    this.getListSimpleFoodTypes();
    if(this.mode === 'edit') {
      this.isEdit =  true;
      this.header = 'Update product';
      this.getProductById(this.productId);
      this.disableFields();
    } else {
      this.header = 'Add product';
    }
    this.toolbarService.updateToolbarContent(this.header);
    // this.toolbarService.subscribeToButtonClick((buttonType: ToolbarButtonType) => {
    //   this.handleButtonClick(buttonType);
    // });

    this.setValidators();
  }

  private handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.Save:
        this.isEdit ? this.openDialog(): this.addProduct();
        this.saveCloseValue = false;
        break;
      case ToolbarButtonType.Update:
        //this.handleUpdateButton();
        break;
      case ToolbarButtonType.SaveClose:
        this.saveCloseValue = true;
        this.isEdit ? this.openDialog(): this.addProduct();
        break;
      case ToolbarButtonType.Cancel:
        this.saveClose();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }


  disableFields(): void {
    this.productGroup.controls['foodTypId'].disable();
    this.productGroup.controls['productCode'].disable();
    this.productGroup.controls['batchId'].disable();
  }

  createFormGroup(): void {
    this.productGroup = this.fb.group({
      foodTypId: [null, Validators.required],
      productPrice: [null, Validators.required],
      productCode: [null],
      addedDate: [null, Validators.required],
      batchId: [null],
      available: [false],
      productDescription: [null, Validators.required],
      image:  [null],
    });

    this.productCount = new FormControl(null);
  }


  public  getListSimpleFoodTypes(): void {
    this.subscription.push(this.foodTypeService.getListSimpleFoodTypes().subscribe((foodTypes: FoodType[]) => {
      this.foodTypes = foodTypes;
    }))
  }

  public getProductById(productId: number): void {
    if (productId> 0) {
      this.subscription.push (this.productService.getProductById(productId).subscribe((foodItem: ProductVM) => {
        this.setValuestoForm(foodItem);
      }));
    }
  }

  setValuestoForm(foodItem: ProductVM): void {
    if(foodItem != null) {
      this.productGroup.setValue({
        foodTypId: foodItem.FoodTypeId,
        productPrice: foodItem.ProductPrice,
        productCode: foodItem.ProductCode,
        addedDate: foodItem.AddedDate,
        batchId: foodItem.BatchId,
        available: foodItem.IsSold,
        productDescription: foodItem.ProductDescription,
        image: foodItem.ImageURL,
      });
    }
    this.imagePreview = foodItem.ImageURL;
    this.batchId =  this.productGroup.controls['batchId'].value;
  }

  openDialog(): void {
    if (this.isEdit) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '500px', // Set the width as per your requirement
        data: {
          title: 'Confirm Save',
          text: `You are updating a record with Batch ID ${this.batchId}. This will also update other records with the same Batch ID. Are you sure you want to proceed?`,
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.updateItem();
        }
      });
    }

  }

  addProduct(): void {
    Object.values(this.productGroup.controls).forEach(control => {
      control.markAsTouched();
      this.productCount.markAsTouched();
    });

    if (this.productGroup.valid) {

      try {
        const formData = this.productGroup.value;
        const addProduct: AddProduct = {
          ProductDescription: formData.productDescription,
          ProductPrice: formData.productPrice,
          ImageURL: formData.image,
          AddedDate: formData.addedDate,
          FoodTypeId: formData.foodTypId,
          ProductCount: this.productCount.value
        };
        const updateResponse = this.productService.addProduct( addProduct);
        this.subscription.push(updateResponse.subscribe((res: any) => {
          console.log(res);
          if (res != null) {
            this.toolbarService.enableButtons(true)
            this.toastr.success('Success!', 'Food item updated!');
            this.getProductById(res);
          }
        }));
        // Now you can do something with the addProduct object, such as sending it to a service
        if ( this.saveCloseValue) {
          this.saveClose();
        }
      }catch (error) {
        this.toolbarService.enableButtons(true)
        console.error('An error occurred while updating the food item:', error);
        this.toastr.error('Error!', 'Failed to update food item.');
      }
    }
  }

  updateItem(): void {
    try {
      this.updateProduct.ImageURL =  this.productGroup.controls['image'].value;
      this.updateProduct.ProductDescription = this.productGroup.controls['productDescription'].value;
      this.updateProduct.AddedDate = this.productGroup.controls['addedDate'].value;
      this.updateProduct.ProductPrice = this.productGroup.controls['productPrice'].value;
      this.updateProduct.IsSold = this.productGroup.controls['available'].value;
      this.updateProduct.Id = this.productId;

      const updateResponse = this.productService.updateProductByBatchId(this.batchId, this.updateProduct);
      this.subscription.push(updateResponse.subscribe((res: any) => {
        console.log(res);
        if (res != null) {
          this.toolbarService.enableButtons(true)
          this.toastr.success('Success!', 'Food item updated!');
          this.getProductById(res);
        }
      }));
    } catch (error) {
      this.toolbarService.enableButtons(true)
      console.error('An error occurred while updating the food item:', error);
      this.toastr.error('Error!', 'Failed to update food item.');
    }
  }


  setValidators(): void {
    if(!this.isEdit) {
      this.productCount.setValidators([Validators.required, CustomValidators.nonNegative()]);
    } else {
      this.productCount.clearValidators();
    this.productCount.updateValueAndValidity();
    }
  }

  saveClose(): void {
    this.router.navigate(['base/product/product'])
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
          image: reader.result,
        });
      };
      this.cd.markForCheck();
    }
    this.productGroup.patchValue({image:file})
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
