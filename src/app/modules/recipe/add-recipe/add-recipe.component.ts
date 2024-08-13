import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, catchError } from 'rxjs';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {
  AddRecipeRequest,
  RecipeRawMaterial,
  RecipeRawMaterialRequest,
  RecipeVM,
  UpdateRecipe,
} from '../../../models/Recipe/Recipe';
import { RecipeService } from '../../../services/bakery/reipe.service';
import { RawMaterialService } from '../../../services/bakery/raw-material.service';
import {
  QuantityType,
  RawMaterialListSimpleVM,
} from '../../../models/RawMaterials/RawMaterial';
import { MatSelectChange } from '@angular/material/select';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import { EnumType } from '../../../models/enum_collection/enumType';
import {
  AllMasterData,
  MasterDataVM,
} from '../../../models/MasterData/MasterData';
import { AddResultVM, ResultView } from 'src/app/models/ResultView';
@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.css'],
})
export class AddRecipeComponent implements OnInit, OnDestroy, AfterViewInit {
  toolBarButtons: ToolbarButtonType[];
  subscription: Subscription[] = [];
  header: string;
  mode: string;
  isEdit: boolean = false;
  saveCloseValue: boolean = false;
  recipeGroup: FormGroup;
  text: string = '<p>Hello, world!</p>';
  public Editor = ClassicEditor;
  dataSource: MatTableDataSource<any>;
  displayedColumns = ['RawMaterial', 'Measureunit', 'Quantity', 'Action'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  rawMaterialList: RawMaterialListSimpleVM[];
  matHint: string;
  recipeId: number;
  updateRecipeValues: UpdateRecipe = new UpdateRecipe();
  measureUnits: MasterDataVM[];
  isView: boolean;
  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private changeDetectorRefs: ChangeDetectorRef,
    private recipeService: RecipeService,
    private rawMaterialService: RawMaterialService,
    private masterDataService: MasterDataService
  ) {}

  ngOnInit() {
    this.getListRawMaterials();
    this.getMeasureUnits();
    this.route.params.subscribe((params) => {
      this.mode = params['mode'];
      const id: number = +params['id'];
      if (id !== null) {
        this.recipeId = id;
      }
    });
    this.createFormGroup();

    this.toolbarService.updateCustomButtons(this.toolBarButtons);

    if (this.mode === 'view') {
      this.toolBarButtons = [ToolbarButtonType.Edit, ToolbarButtonType.Cancel];
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
      this.isView = true;
      this.header = 'View recipe';
      this.toolbarService.updateToolbarContent(this.header);
      this.getRecipeById(this.recipeId);
    } else if (this.mode === 'edit') {
      this.header = 'Edit recipe';
      this.toolbarService.updateToolbarContent(this.header);
      this.toolBarButtons = [
        ToolbarButtonType.Save,
        ToolbarButtonType.SaveClose,
        ToolbarButtonType.Cancel,
      ];
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
    } else {
      this.header = 'Add recipe';
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

  ngAfterViewInit() {
    if (this.paginator && this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
  }

  createFormGroup(): void {
    this.recipeGroup = this.fb.group({
      name: [null, Validators.required],
      addedDate: [null, Validators.required],
      description: [null, Validators.required],
      content: ['', [Validators.required]],
      rawMaterials: this.fb.array([]),
    });
  }

  get rawMaterials() {
    return this.recipeGroup.get('rawMaterials') as FormArray;
  }

  addRow() {
    this.rawMaterials.push(
      this.fb.group({
        rawMaterialId: [null, Validators.required],
        rawMaterialQuantity: [null, Validators.required],
        measureunit: [null, Validators.required],
      })
    );

    this.dataSource = new MatTableDataSource(this.rawMaterials.controls);
    this.dataSource.paginator = this.paginator;
    this.changeDetectorRefs.detectChanges();
  }

  get rawMaterialIdControl() {
    return this.recipeGroup
      .get('rawMaterials')
      .get(`${this.rawMaterials.length - 1}.rawMaterialId`);
  }

  removeRow(index: number) {
    this.rawMaterials.removeAt(index);
    this.dataSource = new MatTableDataSource(this.rawMaterials.controls);
  }

  public handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.Save:
        this.isEdit ? this.updateItem() : this.addRecipe();

        this.saveCloseValue = false;
        break;
      case ToolbarButtonType.Edit:
        this.handleEditButton();
        break;
      case ToolbarButtonType.SaveClose:
        this.saveCloseValue = true;
        this.isEdit ? this.updateItem() : this.addRecipe();
        break;
      case ToolbarButtonType.Cancel:
        this.saveClose();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }


  public getMeasureUnits(): void {
    try {
      const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(EnumType.MeasuringUnit);
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
              this.measureUnits = res.Item.Items;
            }
          })
      );
    } catch (error) {
      console.error('An error occurred while attempting to load master data:', error);
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
                this.setValuestoForm(recipe.Item);
              }
            })
        );
      } catch (error) {
        console.error('An error occurred while attempting to load recipes:', error);
      }
    }
  }

  setValuestoForm(recipe: RecipeVM): void {
    this.recipeGroup.reset();
    this.rawMaterials.clear();
    this.recipeGroup.controls['name'].setValue(recipe.



      RecipeName);
    this.recipeGroup.controls['addedDate'].setValue(recipe.AddedDate);
    this.recipeGroup.controls['description'].setValue(recipe.Description);
    this.recipeGroup.controls['content'].setValue(recipe.Instructions);
    const rawMaterialArray = this.recipeGroup.get('rawMaterials') as FormArray;
    const rawMateriaList = recipe.RawMaterials;
    rawMateriaList.forEach((data, index) => {
      this.rawMaterials.push(
        this.fb.group({
          rawMaterialId: [data.rawMaterialId, Validators.required],
          measureunit: [data.measureUnit],
          rawMaterialQuantity: [
            data.rawMaterialQuantity * 1000,
            Validators.required,
          ],
        })
      );
    });
    this.dataSource = new MatTableDataSource(this.rawMaterials.controls);
    this.changeDetectorRefs.detectChanges();
    if (this.isView) {
      this.disableFormGroup();
    }
  }

  addRecipe(): void {
    Object.values(this.recipeGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
    const rawMaterialsArray = this.rawMaterials;
    const length = rawMaterialsArray.length;
    if (length <= 0) {
      this.toastr.error('Error!', 'Please add atleast one raw material');
      this.toolbarService.enableButtons(true);
      return;
    }

    if (this.recipeGroup.valid && this.getRawMaterialArray().length > 0) {
      try {
        this.toolbarService.enableButtons(false);
        const recipeRequest: AddRecipeRequest = {
          AddedDate: this.recipeGroup.get('addedDate').value,
          RecipeName: this.recipeGroup.get('name').value,
          Description: this.recipeGroup.get('description').value,
          Instructions: this.recipeGroup.get('content').value,
          rawMaterials: this.getRawMaterialArray(),
        };

        const updateResponse = this.recipeService.addRecipe(recipeRequest);

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
                this.getRecipeById(res.Id);
                this.recipeId = res.Id
                if (this.saveCloseValue) {
                  this.saveClose();
                } else {
                  this.router.navigate([
                    'base/recipe/add',
                    'view',
                    this.recipeId,
                  ]);
                  this.header = 'View recipe';
                  this.toolbarService.updateToolbarContent(this.header);
                  this.disableFormGroup();
                  this.removeSpecificButtons();
                }
              }
            })
        );
      } catch (error) {
        this.toolbarService.enableButtons(true);
        console.error('An error occurred while adding recipe:', error);
        this.toastr.error('Error!', 'Failed to add recipe');
      }
    }
  }

  disableFormGroup(): void {
    this.toolBarButtons = [ToolbarButtonType.Edit, ToolbarButtonType.Cancel];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
    this.recipeGroup.disable();
    this.rawMaterials.controls.forEach((control) => {
      control.disable();
    });
    this.changeDetectorRefs.detectChanges();
  }

  enableFormGroup(): void {
    this.header = 'Edit recipe';
    this.toolbarService.updateToolbarContent(this.header);
    this.recipeGroup.enable();
    this.rawMaterials.controls.forEach((control) => {
      control.enable();
    });
    this.changeDetectorRefs.detectChanges();
  }

  handleEditButton(): void {
    this.isView = false;
    this.isEdit = true;
    this.enableFormGroup();
    this.router.navigate(['base/recipe/add', 'edit', this.recipeId]);
    const deleteIndex = this.toolBarButtons.indexOf(ToolbarButtonType.Edit);
    if (deleteIndex !== -1) {
      this.toolBarButtons.splice(deleteIndex, 1);
    }
    this.toolBarButtons = [ToolbarButtonType.Save, ToolbarButtonType.SaveClose];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
  }

  updateItem(): void {
    Object.values(this.recipeGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
    const rawMaterialsArray = this.rawMaterials;
    const length = rawMaterialsArray.length;
    if (length <= 0) {
      this.toastr.error('Error!', 'Please add atleast one raw material');
      this.toolbarService.enableButtons(true);
      return;
    }

    if (this.recipeGroup.valid && this.getRawMaterialArray().length > 0) {
      try {
        this.toolbarService.enableButtons(false);
        this.updateRecipeValues.RecipeName =
          this.recipeGroup.controls['name'].value;
        this.updateRecipeValues.Description =
          this.recipeGroup.controls['description'].value;
        this.updateRecipeValues.Instructions =
          this.recipeGroup.controls['content'].value;
        this.updateRecipeValues.RawMaterials = this.getRawMaterialArray();

        const updateResponse = this.recipeService.updateRecipeById(
          this.recipeId,
          this.updateRecipeValues
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
                this.toastr.success('Success!', 'Recipe updated!');
                this.getRecipeById(res.Id);
                if (this.saveCloseValue) {
                  this.saveClose();
                } else {
                  this.removeSpecificButtons();
                  this.disableFormGroup();
                  this.isView = true;
                  this.header = 'View recipe';
                  this.toolbarService.updateToolbarContent(this.header)
                }
              }
            })
        );
      } catch (error) {
        this.toolbarService.enableButtons(true);
        console.error('An error occurred while updating the recipe:', error);
        this.toastr.error('Error!', 'Failed to update recipe.');
      }
    }
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

  saveClose(): void {
    this.router.navigate(['base/recipe/recipe']);
  }

  getRawMaterialArray(): RecipeRawMaterialRequest[] {
    const rawMaterialsArray: RecipeRawMaterialRequest[] = [];
    this.rawMaterials.controls.forEach((control) => {
      const rawMaterial: RecipeRawMaterialRequest = {
        rawMaterialId: control.get('rawMaterialId').value,
        rawMaterialQuantity: control.get('rawMaterialQuantity').value / 1000,
        measureUnit: control.get('measureunit').value,
      };
      rawMaterialsArray.push(rawMaterial);
    });
    return rawMaterialsArray;
  }

  public getListRawMaterials(): void {
    this.subscription.push(
      this.rawMaterialService
        .listSimpleRawmaterials()
        .subscribe((res: ResultView<RawMaterialListSimpleVM[]>) => {
          this.rawMaterialList = res.Item;
        })
    );
  }
  selectRawMaterial(value: MatSelectChange, rowIndex: number): void {
    const Id = value.value;
    if (this.rawMaterials.length > 0) {
      if (
        this.rawMaterials.controls[rowIndex].get('rawMaterialId').value !== null
      ) {
        const isDuplicate = this.rawMaterials.controls.some(
          (control, index) =>
            control.get('rawMaterialId').value === Id && index !== rowIndex
        );

        if (isDuplicate) {
          this.toastr.error(
            'Duplicate ID. Cannot add the same raw material again.'
          );
          this.rawMaterials.controls[rowIndex]
            .get('rawMaterialId')
            .setValue(null);
          return;
        }
      }
    }
    const material = this.rawMaterialList.find((item) => item.Id === Id);
    if (material) {
      this.selectType(material.MeasureUnit);
      this.rawMaterials
        .at(rowIndex)
        .get('measureunit')
        .setValue(material.MeasureUnit);
    }
  }
  selectType(value: number): void {
    switch (value) {
      case QuantityType.Kg:
        this.matHint = 'Please add in grams';
        break;
      case QuantityType.L:
        this.matHint = 'Please add in milliliters';
        break;
      default:
        this.matHint = '';
    }
  }

  isIdAlreadySelected(id: number): boolean {
    return this.rawMaterials.value.some((row) => row.rawMaterialId === id);
  }

  getQuantityType(value: number): string {
    return QuantityType[value];
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
