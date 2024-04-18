import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, concatAll } from 'rxjs';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from 'src/app/models/enum_collection/toolbar-button';
import { FoodTypeService } from '../../../services/bakery/food-type.service';
import { FoodType } from '../../../models/FoodItems/foodType';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FoodItemsService } from '../../../services/bakery/food-items.service';
import { AddFoodItem, FoodItemVM, UpdateFoodItem } from '../../../models/FoodItems/foodItem';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { NotifierService } from 'angular-notifier';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from '../../../shared/utils/custom-validators';
@Component({
  selector: 'app-add-food-item',
  templateUrl: './add-food-item.component.html',
  styleUrls: ['./add-food-item.component.css'],
})
export class AddFoodItemComponent implements OnInit, OnDestroy {
  subscription: Subscription[] = [];
  header: string;
  mode: string;
  foodItemId: number;
  foodTypes: FoodType[] = [];
  foodItemGroup: FormGroup;
  batchId: any;
  updateFoodItem: UpdateFoodItem = new UpdateFoodItem();
  newFoodItem: AddFoodItem = new AddFoodItem();
  isEdit: boolean = false;
  @ViewChild('fileInput') fileInput: ElementRef;
  imagePreview: string;
  foodCount:FormControl;
  saveCloseValue: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private foodTypeService: FoodTypeService,
    private fb: FormBuilder,
    private foodItemService: FoodItemsService,
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
        this.foodItemId  =  id;
      }
    });
    this.createFormGroup();

    this.toolbarService.updateCustomButtons([ToolbarButtonType.Save, ToolbarButtonType.SaveClose, ToolbarButtonType.Cancel ]);
    this.getListSimpleFoodTypes();
    if(this.mode === 'edit') {
      this.isEdit =  true;
      this.header = 'Update food item';
      this.getFoodItemById(this.foodItemId);
      this.disableFields();
    } else {
      this.header = 'Add food item';
    }
    this.toolbarService.updateToolbarContent(this.header);

    this.subscription.push(this.toolbarService.buttonClick$.subscribe((buttonType) => {
      if (buttonType) {
        this.handleButtonClick(buttonType);
      }
    }));
    this.setValidators();
  }

  private handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.Save:
        this.isEdit ? this.openDialog(): this.addFoodItem();
        this.saveCloseValue = false;
        break;
      case ToolbarButtonType.Update:
        //this.handleUpdateButton();
        break;
      case ToolbarButtonType.SaveClose:
        this.saveCloseValue = true;
        this.isEdit ? this.openDialog(): this.addFoodItem();
        break;
      case ToolbarButtonType.Cancel:
        this.saveClose();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }


  disableFields(): void {
    this.foodItemGroup.controls['foodTypId'].disable();
    this.foodItemGroup.controls['foodCode'].disable();
    this.foodItemGroup.controls['batchId'].disable();
  }

  createFormGroup(): void {
    this.foodItemGroup = this.fb.group({
      foodTypId: [null, Validators.required],
      foodPrice: [null, Validators.required],
      foodCode: [null],
      addedDate: [null, Validators.required],
      batchId: [null],
      available: [false],
      foodDescription: [null, Validators.required],
      image:  [null],
    });

    this.foodCount = new FormControl(null);
  }


  public  getListSimpleFoodTypes(): void {
    this.subscription.push(this.foodTypeService.getListSimpleFoodTypes().subscribe((foodTypes: FoodType[]) => {
      this.foodTypes = foodTypes;
    }))
  }

  public getFoodItemById(foodItemId: number): void {
    if (foodItemId> 0) {
      this.subscription.push (this.foodItemService.getFoodItemById(foodItemId).subscribe((foodItem: FoodItemVM) => {
        this.setValuestoForm(foodItem);
      }));
    }
  }

  setValuestoForm(foodItem: FoodItemVM): void {
    if(foodItem != null) {
      this.foodItemGroup.setValue({
        foodTypId: foodItem.FoodTypeId,
        foodPrice: foodItem.FoodPrice,
        foodCode: foodItem.FoodCode,
        addedDate: foodItem.AddedDate,
        batchId: foodItem.BatchId,
        available: foodItem.IsSold,
        foodDescription: foodItem.FoodDescription,
        image: foodItem.ImageURL,
      });
    }
    this.imagePreview = foodItem.ImageURL;
    this.batchId =  this.foodItemGroup.controls['batchId'].value;
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

  addFoodItem(): void {
    Object.values(this.foodItemGroup.controls).forEach(control => {
      control.markAsTouched();
      this.foodCount.markAsTouched();
    });

    if (this.foodItemGroup.valid) {

      try {
        const formData = this.foodItemGroup.value;
        const addFoodItem: AddFoodItem = {
          FoodDescription: formData.foodDescription,
          FoodPrice: formData.foodPrice,
          ImageURL: formData.image,
          AddedDate: formData.addedDate,
          FoodTypeId: formData.foodTypId,
          FoodItemCount: this.foodCount.value
        };
        console.log(addFoodItem);
        const updateResponse = this.foodItemService.addFoodItems( addFoodItem);
        this.subscription.push(updateResponse.subscribe((res: any) => {
          console.log(res);
          if (res != null) {
            this.toastr.success('Success!', 'Food item updated!');
            this.getFoodItemById(res);
          }
        }));
        // Now you can do something with the addFoodItem object, such as sending it to a service
        if ( this.saveCloseValue) {
          this.saveClose();
        }
      }catch (error) {
        console.error('An error occurred while updating the food item:', error);
        this.toastr.error('Error!', 'Failed to update food item.');
      }
    }
  }

  updateItem(): void {
    try {
      this.updateFoodItem.ImageURL =  this.foodItemGroup.controls['image'].value;
      this.updateFoodItem.FoodDescription = this.foodItemGroup.controls['foodDescription'].value;
      this.updateFoodItem.AddedDate = this.foodItemGroup.controls['addedDate'].value;
      this.updateFoodItem.FoodPrice = this.foodItemGroup.controls['foodPrice'].value;
      this.updateFoodItem.IsSold = this.foodItemGroup.controls['available'].value;
      this.updateFoodItem.Id = this.foodItemId;

      const updateResponse = this.foodItemService.updateItemsByBatchId(this.batchId, this.updateFoodItem);
      this.subscription.push(updateResponse.subscribe((res: any) => {
        console.log(res);
        if (res != null) {
          this.toastr.success('Success!', 'Food item updated!');
          this.getFoodItemById(res);
        }
      }));
    } catch (error) {
      console.error('An error occurred while updating the food item:', error);
      this.toastr.error('Error!', 'Failed to update food item.');
    }
  }


  setValidators(): void {
    if(!this.isEdit) {
      this.foodCount.setValidators([Validators.required, CustomValidators.nonNegative()]);
    } else {
      this.foodCount.clearValidators();
    this.foodCount.updateValueAndValidity();
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
        this.foodItemGroup.patchValue({
          image: reader.result,
        });
      };
      this.cd.markForCheck();
    }
    this.foodItemGroup.patchValue({image:file})
  }

  ngOnDestroy(): void {
    this.toolbarService.updateCustomButtons([]);
    this.toolbarService.updateToolbarContent('');
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

}
