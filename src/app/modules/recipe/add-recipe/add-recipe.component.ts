import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AddRecipeRequest, RecipeRawMaterial, RecipeVM, UpdateRecipe } from '../../../models/Recipe/Recipe';
import { RecipeService } from '../../../services/bakery/reipe.service';
import { RawMaterialService } from '../../../services/bakery/raw-material.service';
import { QuantityType, RawMaterialListSimpleVM } from '../../../models/RawMaterials/RawMaterial';
import { MatSelectChange } from '@angular/material/select';
@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.css']
})
export class AddRecipeComponent implements OnInit, OnDestroy, AfterViewInit   {
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
rawMaterialList:RawMaterialListSimpleVM[]
  matHint: string;
  recipeId: number;
  updateRecipe: UpdateRecipe = new UpdateRecipe();

  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private changeDetectorRefs: ChangeDetectorRef,
    private recipeService: RecipeService,
    private rawMaterialService:RawMaterialService

  ) {
  }

  ngOnInit() {
    this.getListRawMaterials();
    this.route.params.subscribe((params) => {
      this.mode = params['mode'];
      const id: number= +params['id'];
      if (id !== null) {
        this.recipeId  =  id;

      }
    });

    this.createFormGroup();

    this.toolbarService.updateCustomButtons([ToolbarButtonType.Save, ToolbarButtonType.SaveClose, ToolbarButtonType.Cancel ]);

    if(this.mode === 'edit') {
      this.isEdit =  true;
      this.header = 'Update raw material';
      this.getRecipeById(this.recipeId);
      //this.disableFields();
    } else {
      this.header = 'Add raw material';
    }
    this.toolbarService.updateToolbarContent(this.header);
    this.toolbarService.subscribeToButtonClick((buttonType: ToolbarButtonType) => {
      this.handleButtonClick(buttonType);
    });
   // this.setValidators();
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
      content: ['', [
        Validators.required
      ]],
      rawMaterials: this.fb.array([])
    });

  }

  get rawMaterials() {
    return this.recipeGroup.get('rawMaterials') as FormArray;
  }


  addRow() {



    this.rawMaterials.push(this.fb.group({
      rawMaterialId: [null, Validators.required],
      rawMaterialQuantity: [null, Validators.required],
      measureunit: [null, Validators.required]
    }));

    this.dataSource = new MatTableDataSource(this.rawMaterials.controls);
    this.dataSource.paginator = this.paginator;
    this.changeDetectorRefs.detectChanges();

  }

  get rawMaterialIdControl() {
    return this.recipeGroup.get('rawMaterials').get(`${this.rawMaterials.length - 1}.rawMaterialId`);
  }

  removeRow(index: number) {
    this.rawMaterials.removeAt(index);
    this.dataSource = new MatTableDataSource(this.rawMaterials.controls);
  }

  private handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.Save:
       this.isEdit ? this.updateItem():  this.addRecipe();

        this.saveCloseValue = false;
        break;
      case ToolbarButtonType.Update:
        //this.handleUpdateButton();
        break;
      case ToolbarButtonType.SaveClose:
        this.saveCloseValue = true;
        this.isEdit ? this.updateItem(): this.addRecipe();
        break;
      case ToolbarButtonType.Cancel:
        //this.saveClose();
        this.getRecipeById(4)
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }

  getRecipeById(id: number): void  {
    if (id> 0) {
      this.subscription.push (this.recipeService.getRecipeById(id).subscribe((recipe: RecipeVM) => {
       this.setValuestoForm(recipe);
      }));
    }
  }

  setValuestoForm(recipe: RecipeVM): void {
    this.recipeGroup.reset();
    this.rawMaterials.clear();
    this.recipeGroup.controls['name'].setValue(recipe.RecipeName);
    this.recipeGroup.controls['addedDate'].setValue( recipe.AddedDate);
    this.recipeGroup.controls['description'].setValue( recipe.Description);
    this.recipeGroup.controls['content'].setValue(recipe.Instructions);
    const rawMaterialArray = this.recipeGroup.get('rawMaterials') as FormArray;
    const rawMateriaList =  recipe.RawMaterials;
    rawMateriaList.forEach((data, index) => {
      this.rawMaterials.push(
        this.fb.group({
          rawMaterialId: [data.rawMaterialId, Validators.required],
          measureunit: ["Kg"],
          rawMaterialQuantity: [(data.rawMaterialQuantity)*1000, Validators.required],
        })
      );
    });
    this.dataSource = new MatTableDataSource(this.rawMaterials.controls);
    this.changeDetectorRefs.detectChanges();
    console.log(this.recipeGroup.value)
  }

  addRecipe(): void {
    console.log(this.recipeGroup.value);
    Object.values(this.recipeGroup.controls).forEach(control => {
      control.markAsTouched();
    });

    if(this.recipeGroup.valid) {
      try {
        const recipeRequest: AddRecipeRequest = {
          AddedDate: this.recipeGroup.get('addedDate').value,
          RecipeName: this.recipeGroup.get('name').value,
          Description: this.recipeGroup.get('description').value,
          Instructions: this.recipeGroup.get('content').value,
          rawMaterials: this.getRawMaterialArray()
        };
        console.log(recipeRequest);
        const updateResponse = this.recipeService.addRecipe( recipeRequest);
        this.subscription.push(updateResponse.subscribe((res: any) => {
          console.log(res);
          if (res != null) {
            this.toolbarService.enableButtons(true)
            this.toastr.success('Success!', 'Raw material updated!');
           this.getRecipeById(res);
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
      this.updateRecipe.RecipeName =  this.recipeGroup.controls['name'].value;
      this.updateRecipe.Description = this.recipeGroup.controls['description'].value;
      this.updateRecipe.Instructions = this.recipeGroup.controls['content'].value;
      this.updateRecipe.RawMaterials= this.getRawMaterialArray()

      const updateResponse = this.recipeService.updateRecipeById(this.recipeId, this.updateRecipe);
      this.subscription.push(updateResponse.subscribe((res: any) => {
        if (res != null) {
          this.toastr.success('Success!', 'Recipe updated!');
          this.toolbarService.enableButtons(true)
          this.getRecipeById(res);
        }
      }));
    } catch (error) {
      this.toolbarService.enableButtons(true)
      console.error('An error occurred while updating the recipe:', error);
      this.toastr.error('Error!', 'Failed to update recipe.');
    }
  }

  saveClose(): void {
    this.router.navigate(['base/recipe/recipe'])
  }


  getRawMaterialArray(): RecipeRawMaterial[] {
    const rawMaterialsArray: RecipeRawMaterial[] = [];
    this.rawMaterials.controls.forEach(control => {
      const rawMaterial: RecipeRawMaterial = {
        rawMaterialId: control.get('rawMaterialId').value,
        rawMaterialQuantity: ((control.get('rawMaterialQuantity').value)/1000)
      };
      rawMaterialsArray.push(rawMaterial);
    });
    return rawMaterialsArray;
  }

  public  getListRawMaterials(): void {
    this.subscription.push(this.rawMaterialService.listSimpleRawmaterials().subscribe((rawMaterials: RawMaterialListSimpleVM[]) => {
      this.rawMaterialList = rawMaterials;
    }))
  }
  selectRawMaterial(value: MatSelectChange, rowIndex: number): void {
    const Id = value.value;
    if (this.rawMaterials.length > 0) {
      if (this.rawMaterials.controls[rowIndex].get('rawMaterialId').value !== null) {

        const isDuplicate = this.rawMaterials.controls.some((control, index) =>
          control.get('rawMaterialId').value === Id && index !== rowIndex
        );

        if (isDuplicate) {
;
          this.toastr.error('Duplicate ID. Cannot add the same raw material again.');
          this.rawMaterials.controls[rowIndex].get('rawMaterialId').setValue(null);
          return;
        }
      }
    }
    const material = this.rawMaterialList.find(item => item.Id === Id);
    if (material) {
      this.selectType(material.MeasureUnit);
      this.rawMaterials.at(rowIndex).get('measureunit').setValue(this.getQuantityType(material.MeasureUnit));
    }
  }
  selectType(value: number): void{

    switch (value) {
      case QuantityType.Kg:
        this.matHint = "Please add in grams";
        break;
      case QuantityType.L:
        this.matHint = "Please add in milliliters";
        break;
      default:
        this.matHint = "";

    }
  }


  isIdAlreadySelected(id: number): boolean {
    return this.rawMaterials.value.some(row => row.rawMaterialId === id);
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