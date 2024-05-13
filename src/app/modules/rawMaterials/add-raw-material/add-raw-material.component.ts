
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AddRawMaterial, QuantityType, RawMaterialVM, UpdateRawMaterial } from '../../../models/RawMaterials/RawMaterial';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { RawMaterialService } from '../../../services/bakery/raw-material.service';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { CustomValidators } from '../../../shared/utils/custom-validators';
@Component({
  selector: 'app-add-raw-material',
  templateUrl: './add-raw-material.component.html',
  styleUrls: ['./add-raw-material.component.css']
})
export class AddRawMaterialComponent implements OnInit, OnDestroy  {
  subscription: Subscription[] = [];
  header: string;
  mode: string;
  isEdit: boolean = false;
  saveCloseValue: boolean = false;
  rawMaterialGroup: FormGroup;
  imagePreview: string = "assets/main images/placeholder.png";
  quantityTypes: any[] = [
    {measureUnit: 0, name: "Kg"}, {measureUnit: 1, name: "L"}
  ]
  locations: any[] = [
    {locationId: 0, name: "Matara"}, {locationId: 1, name: "Colombo"}
  ]
  @ViewChild('fileInput') fileInput: ElementRef;
  quantity:FormControl;
  unitPrice:FormControl;
  quantityType: string;
  rawMaterialId: number;
  updateRawMaterial: UpdateRawMaterial = new UpdateRawMaterial();
  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private router: Router,
    private rawMaterialService:RawMaterialService
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.mode = params['mode'];
      const id: number= +params['id'];
      if (id !== null) {
        this.rawMaterialId  =  id;

      }
    });
    this.createFormGroup();

    this.toolbarService.updateCustomButtons([ToolbarButtonType.Save, ToolbarButtonType.SaveClose, ToolbarButtonType.Cancel ]);

    if(this.mode === 'edit') {
      this.isEdit =  true;
      this.header = 'Update raw material';
      this.getRawMaterialById(this.rawMaterialId);
      //this.disableFields();
    } else {
      this.header = 'Add raw material';
    }
    this.toolbarService.updateToolbarContent(this.header);
    this.setValidators();
  }

  lastButtonClick: string = '';

  handleButtonClick(buttonType: ToolbarButtonType) {
    switch (buttonType) {
      case ToolbarButtonType.Save:
       this.isEdit ? this.updateItem():  this.addRawMaterial();
        this.saveCloseValue = false;
        break;
      case ToolbarButtonType.Update:
        //this.handleUpdateButton();
        break;
      case ToolbarButtonType.SaveClose:
        this.saveCloseValue = true;
        this.isEdit ? this.updateItem(): this.addRawMaterial();
        break;
      case ToolbarButtonType.Cancel:
        this.saveClose();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }
  disableFields() {
    throw new Error('Method not implemented.');
  }



  createFormGroup(): void {
    this.rawMaterialGroup = this.fb.group({
      name: [null, Validators.required],
      addedDate: [null, Validators.required],
      measureUnit: [null, Validators.required],
      imageURL:  [null],
      modifiedDate:[null],
      locationId: [null]
    });
    this.quantity = new FormControl(null);
    this.unitPrice = new FormControl(null);
    this.unitPrice.setValidators([Validators.required, CustomValidators.nonNegative()]);
  }

  addRawMaterial() {
    Object.values(this.rawMaterialGroup.controls).forEach(control => {
      control.markAsTouched();
      this.quantity.markAsTouched();

    });

    if(this.rawMaterialGroup.valid) {

      try {
        this.toolbarService.enableButtons(false)

        const formData = this.rawMaterialGroup.value;
        const addRawMaterial: AddRawMaterial = {
          Name: formData.name,
          Quantity: this.quantity.value,
          ImageURL: formData.imageURL,
          AddedDate: formData.addedDate,
          MeasureUnit: formData.measureUnit,
          Price: this.unitPrice.value,
          LocationId: formData.locationId,
        };
        console.log(addRawMaterial);
        const updateResponse = this.rawMaterialService.addRawMaterial( addRawMaterial);
        this.subscription.push(updateResponse.subscribe((res: any) => {
          console.log(res);
          if (res != null) {
            this.toolbarService.enableButtons(true)
            this.toastr.success('Success!', 'Raw material updated!');
            this.getRawMaterialById(res);
          }
        }));
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
      this.toolbarService.enableButtons(false)
      this.updateRawMaterial.ImageURL =  this.rawMaterialGroup.controls['imageURL'].value;
      this.updateRawMaterial.Name = this.rawMaterialGroup.controls['name'].value;
      this.updateRawMaterial.Quantity = this.quantity.value;
      this.updateRawMaterial.MeasureUnit = this.rawMaterialGroup.controls['measureUnit'].value;
      this.updateRawMaterial.Price =  this.unitPrice.value;
      this.updateRawMaterial.LocationId = this.rawMaterialGroup.controls['locationId'].value;

      const updateResponse = this.rawMaterialService.updateRawMaterialById(this.rawMaterialId, this.updateRawMaterial);
      this.subscription.push(updateResponse.subscribe((res: any) => {
        if (res != null) {
          this.toastr.success('Success!', 'Food item updated!');
          this.toolbarService.enableButtons(true)

          this.getRawMaterialById(res);
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
      this.quantity.setValidators([Validators.required, CustomValidators.nonNegative()]);
    } else {
      this.quantity.clearValidators();
    this.quantity.updateValueAndValidity();
    }
  }


  getRawMaterialById(id: number): void  {
    if (id> 0) {
      this.subscription.push (this.rawMaterialService.getRawMaterialById(id).subscribe((rawMaterial: RawMaterialVM) => {
       this.setValuestoForm(rawMaterial);
      }));
    }
  }

  setValuestoForm(rawMaterial: RawMaterialVM): void {
    if(rawMaterial != null) {
      this.rawMaterialGroup.setValue({
        name: rawMaterial.Name,
        addedDate: rawMaterial.AddedDate,
        measureUnit: rawMaterial.MeasureUnit,
        modifiedDate: rawMaterial.ModifiedDate,
        imageURL: rawMaterial.ImageURL,
        locationId: rawMaterial.LocationId
      });
    }
    this.quantity.setValue(rawMaterial.Quantity);
    if (rawMaterial.ImageURL != null && rawMaterial.ImageURL !== "string") {
      this.imagePreview = rawMaterial.ImageURL;
    }
    this.unitPrice.setValue(rawMaterial.Price);
  }

  selectType(value: MatSelectChange): void{
    console.log(value.value);
    switch (value.value) {
      case QuantityType.Kg:
        this.quantityType = "Kg";
        break;
      case QuantityType.L:
        this.quantityType = "L";
        break;
      default:
        this.quantityType = "";

    }
  }

  saveClose(): void {
    this.router.navigate(['base/rawMaterial/rawMaterial'])
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
        this.rawMaterialGroup.patchValue({
          imageURL: reader.result,
        });
      };
      this.cd.markForCheck();
    }
    this.rawMaterialGroup.patchValue({imageURL:file})
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
