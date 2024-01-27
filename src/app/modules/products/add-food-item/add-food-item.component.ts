import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from 'src/app/models/enum_collection/toolbar-button';
import { FoodTypeService } from '../../../services/bakery/food-type.service';
import { FoodType } from '../../../models/FoodItems/foodType';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FoodItemsService } from '../../../services/bakery/food-items.service';
import { FoodItemVM, UpdateFoodItem } from '../../../models/FoodItems/foodItem';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
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
  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private foodTypeService: FoodTypeService,
    private fb: FormBuilder,
    private foodItemService: FoodItemsService,
    private dialog: MatDialog
  ) {}
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.mode = params['mode'];
      this.foodItemId = +params['id'];
    });
    this.createFormGroup();
    this.header = 'Add food item';
    this.toolbarService.updateCustomButtons([ToolbarButtonType.Save, ToolbarButtonType.Cancel]);
    this.toolbarService.updateToolbarContent(this.header);
    this.getListSimpleFoodTypes();
    if(this.mode === 'edit') {
      this.header = 'Update food item';
      this.getFoodItemById(this.foodItemId);
      this.disableFields();
    }
    this.subscription.push(this.toolbarService.buttonClick$.subscribe((buttonType) => {
      if (buttonType) {
        this.handleButtonClick(buttonType);
      }
    }));
  }

  private handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.Save:
        this.openDialog();
        break;
      case ToolbarButtonType.Update:
        //this.handleUpdateButton();
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
      foodTypId: [null],
      foodPrice: [null],
      foodCode: [null],
      addedDate: [null],
      batchId: [null],
      available: [false],
      foodDescription: [null]
    });
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
        foodDescription: foodItem.FoodDescription
      });
    }
    this.batchId =  this.foodItemGroup.controls['batchId'].value;
  }

  openDialog(): void {
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
      // Handle the result here
      console.log('Dialog closed with result:', result);
    });
  }

  updateItem(): void {
    this.updateFoodItem.FoodDescription = this.foodItemGroup.controls['foodDescription'].value;
    this.updateFoodItem.AddedDate = this.foodItemGroup.controls['addedDate'].value;
    this.updateFoodItem.ImageURL = 'sdsd'
    this.updateFoodItem.FoodPrice = this.foodItemGroup.controls['foodPrice'].value;
    this.updateFoodItem.IsSold = this.foodItemGroup.controls['available'].value;
    this.updateFoodItem.Id = this.foodItemId;
    this.subscription.push(this.foodItemService.updateItemsByBatchId(this.batchId, this.updateFoodItem).subscribe((res: any)=>{
      console.log(res);
      if(res != null) {
        this.getFoodItemById(res);
      }
    }))

  }

  ngOnDestroy(): void {
    this.toolbarService.updateCustomButtons([]);
    this.toolbarService.updateToolbarContent('');
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

}
