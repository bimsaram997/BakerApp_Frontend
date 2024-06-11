import {
  ChangeDetectorRef,
  Component,
  ElementRef,
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
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError } from 'rxjs';
import {
  AddRawMaterial,
  QuantityType,
  RawMaterialVM,
  UpdateRawMaterial,
} from '../../../models/RawMaterials/RawMaterial';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { RawMaterialService } from '../../../services/bakery/raw-material.service';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { CustomValidators } from '../../../shared/utils/custom-validators';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import { EnumType } from '../../../models/enum_collection/enumType';
import {
  AllMasterData,
  MasterDataVM,
} from '../../../models/MasterData/MasterData';
import { AddResultVM, ResultView } from 'src/app/models/ResultView';
@Component({
  selector: 'app-add-raw-material',
  templateUrl: './add-raw-material.component.html',
  styleUrls: ['./add-raw-material.component.css'],
})
export class AddRawMaterialComponent implements OnInit, OnDestroy {
  subscription: Subscription[] = [];
  header: string;
  mode: string;
  isEdit: boolean = false;
  saveCloseValue: boolean = false;
  rawMaterialGroup: FormGroup;
  imagePreview: string = 'assets/main images/placeholder.png';
  quantityTypes: MasterDataVM[];
  locations: any[] = [
    { locationId: 0, name: 'Matara' },
    { locationId: 1, name: 'Colombo' },
  ];
  @ViewChild('fileInput') fileInput: ElementRef;
  quantity: FormControl;
  unitPrice: FormControl;
  quantityType: string;
  rawMaterialId: number;
  updateRawMaterial: UpdateRawMaterial = new UpdateRawMaterial();
  toolBarButtons: ToolbarButtonType[];
  isView: boolean;
  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private router: Router,
    private rawMaterialService: RawMaterialService,
    private masterDataService: MasterDataService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.mode = params['mode'];
      const id: number = +params['id'];
      if (id !== null) {
        this.rawMaterialId = id;
      }
    });
    this.getMeasureUnits();
    this.createFormGroup();
    this.toolbarService.updateCustomButtons(this.toolBarButtons);

    if (this.mode === 'view') {
      this.toolBarButtons = [ToolbarButtonType.Edit, ToolbarButtonType.Cancel];
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
      this.isView = true;
      this.header = 'View raw material';
      this.toolbarService.updateToolbarContent(this.header);
      this.getRawMaterialById(this.rawMaterialId);
    } else if (this.mode === 'edit') {
      this.header = 'Edit raw material';
      this.toolbarService.updateToolbarContent(this.header);
      this.toolBarButtons = [
        ToolbarButtonType.Save,
        ToolbarButtonType.SaveClose,
        ToolbarButtonType.Cancel,
      ];
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
    } else {
      this.header = 'Add raw material';
      this.toolbarService.updateToolbarContent(this.header);
      this.toolBarButtons = [
        ToolbarButtonType.Save,
        ToolbarButtonType.SaveClose,
        ToolbarButtonType.Cancel,
      ];
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
    }
    this.toolbarService.updateToolbarContent(this.header);
    this.setValidators();
  }

  lastButtonClick: string = '';

  handleButtonClick(buttonType: ToolbarButtonType) {
    switch (buttonType) {
      case ToolbarButtonType.Save:
        this.isEdit ? this.updateItem() : this.addRawMaterial();
        this.saveCloseValue = false;
        break;
      case ToolbarButtonType.Edit:
        this.handleEditButton();
        break;
      case ToolbarButtonType.SaveClose:
        this.saveCloseValue = true;
        this.isEdit ? this.updateItem() : this.addRawMaterial();
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
      imageURL: [null],
      modifiedDate: [null],
      locationId: [null],
    });
    this.quantity = new FormControl(null);
    this.unitPrice = new FormControl(null);
    this.unitPrice.setValidators([
      Validators.required,
      CustomValidators.nonNegative(),
    ]);
  }

  public getMeasureUnits(): void {
    try {
      const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(
        EnumType.MeasuringUnit
      );
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
              this.quantityTypes = res.Item.Items;
            }
          })
      );
    } catch (error) {
      console.error(
        'An error occurred while attempting to load master data:',
        error
      );
    }
  }

  disableFormGroup(): void {
    this.toolBarButtons = [ToolbarButtonType.Edit, ToolbarButtonType.Cancel];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
    this.rawMaterialGroup.disable();
    this.cd.detectChanges();
  }

  enableFormGroup(): void {
    this.header = 'Edit raw material';
    this.toolbarService.updateToolbarContent(this.header);
    this.rawMaterialGroup.enable();
    this.cd.detectChanges();
  }

  handleEditButton(): void {
    this.isView = false;
    this.isEdit = true;
    this.enableFormGroup();
    this.router.navigate(['base/rawMaterial/add', 'edit', this.rawMaterialId]);
    const deleteIndex = this.toolBarButtons.indexOf(ToolbarButtonType.Edit);
    if (deleteIndex !== -1) {
      this.toolBarButtons.splice(deleteIndex, 1);
    }
    this.toolBarButtons = [ToolbarButtonType.Save, ToolbarButtonType.SaveClose];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
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

  addRawMaterial() {
    Object.values(this.rawMaterialGroup.controls).forEach((control) => {
      control.markAsTouched();
      this.quantity.markAsTouched();
    });

    if (this.rawMaterialGroup.valid) {
      try {
        this.toolbarService.enableButtons(false);

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
        const updateResponse =
          this.rawMaterialService.addRawMaterial(addRawMaterial);

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
                this.toastr.success('Success!', 'Recipe added!');
                this.getRawMaterialById(res.Id);
                this.rawMaterialId = res.Id;
                if (this.saveCloseValue) {
                  this.saveClose();
                } else {
                  this.router.navigate([
                    'base/rawMaterial/add',
                    'view',
                    this.rawMaterialId,
                  ]);
                  this.header = 'View raw material';
                  this.toolbarService.updateToolbarContent(this.header);
                  this.disableFormGroup();
                  this.removeSpecificButtons();
                }
              }
            })
        );
      } catch (error) {
        this.toolbarService.enableButtons(true);
        console.error(
          'An error occurred while updating the raw material:',
          error
        );
        this.toastr.error('Error!', 'Failed to add raw material');
      }
    }
  }

  updateItem(): void {
    Object.values(this.rawMaterialGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
    if (this.rawMaterialGroup.valid) {
      try {
        this.toolbarService.enableButtons(false);
        this.updateRawMaterial.ImageURL =
          this.rawMaterialGroup.controls['imageURL'].value;
        this.updateRawMaterial.Name =
          this.rawMaterialGroup.controls['name'].value;
        this.updateRawMaterial.Quantity = this.quantity.value;
        this.updateRawMaterial.MeasureUnit =
          this.rawMaterialGroup.controls['measureUnit'].value;
        this.updateRawMaterial.Price = this.unitPrice.value;
        this.updateRawMaterial.LocationId =
          this.rawMaterialGroup.controls['locationId'].value;

        const updateResponse = this.rawMaterialService.updateRawMaterialById(
          this.rawMaterialId,
          this.updateRawMaterial
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
                this.toastr.success('Success!', 'Raw material updated!');
                this.getRawMaterialById(res.Id);
                if (this.saveCloseValue) {
                  this.saveClose();
                } else {
                  this.removeSpecificButtons();
                  this.disableFormGroup();
                  this.isView = true;
                  this.header = 'View Raw material';
                  this.toolbarService.updateToolbarContent(this.header);
                }
              }
            })
        );
      } catch (error) {
        this.toolbarService.enableButtons(true);
        console.error('An error occurred while updating raw material', error);
        this.toastr.error('Error!', 'Failed to update raw material.');
      }
    }
  }

  setValidators(): void {
    if (!this.isEdit) {
      this.quantity.setValidators([
        Validators.required,
        CustomValidators.nonNegative(),
      ]);
    } else {
      this.quantity.clearValidators();
      this.quantity.updateValueAndValidity();
    }
  }

  getRawMaterialById(id: number): void {
    if (id > 0) {
      try {
        const resultResponse = this.rawMaterialService.getRawMaterialById(id);
        this.subscription.push(
          resultResponse
            .pipe(
              catchError((error) => {
                this.toastr.error('Error!', error.error.Message);
                return error;
              })
            )
            .subscribe((rawMaterial: ResultView<RawMaterialVM>) => {
              if (rawMaterial != null) {
                this.setValuestoForm(rawMaterial.Item);
              }
            })
        );
      } catch (error) {
        console.error('An error occurred while attempting to log in:', error);
      }
    }
  }

  setValuestoForm(rawMaterial: RawMaterialVM): void {
    if (rawMaterial != null) {
      this.rawMaterialGroup.setValue({
        name: rawMaterial.Name,
        addedDate: rawMaterial.AddedDate,
        measureUnit: rawMaterial.MeasureUnit,
        modifiedDate: rawMaterial.ModifiedDate,
        imageURL: rawMaterial.ImageURL,
        locationId: rawMaterial.LocationId,
      });
    }
    this.quantity.setValue(rawMaterial.Quantity);
    if (rawMaterial.ImageURL != null && rawMaterial.ImageURL !== 'string') {
      this.imagePreview = rawMaterial.ImageURL;
    }
    this.unitPrice.setValue(rawMaterial.Price);
  }

  selectType(value: MatSelectChange): void {
    console.log(value.value);
    switch (value.value) {
      case QuantityType.Kg:
        this.quantityType = 'Kg';
        break;
      case QuantityType.L:
        this.quantityType = 'L';
        break;
      default:
        this.quantityType = '';
    }
  }

  saveClose(): void {
    this.router.navigate(['base/rawMaterial/rawMaterial']);
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
        this.rawMaterialGroup.patchValue({
          imageURL: reader.result,
        });
      };
      this.cd.markForCheck();
    }
    this.rawMaterialGroup.patchValue({ imageURL: file });
  }
  triggerFileInput() {
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
