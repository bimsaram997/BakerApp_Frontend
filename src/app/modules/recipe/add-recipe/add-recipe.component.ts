import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.css']
})
export class AddRecipeComponent implements OnInit, OnDestroy  {
  subscription: Subscription[] = [];
  header: string;
  mode: string;
  isEdit: boolean = false;
  saveCloseValue: boolean = false;
  recipeGroup: FormGroup;
  text: string = '<p>Hello, world!</p>';


  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private router: Router,

  ) {
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.mode = params['mode'];
      const id: number= +params['id'];
      if (id !== null) {
        //this.rawMaterialId  =  id;

      }
    });
    this.createFormGroup();

    this.toolbarService.updateCustomButtons([ToolbarButtonType.Save, ToolbarButtonType.SaveClose, ToolbarButtonType.Cancel ]);

    if(this.mode === 'edit') {
      this.isEdit =  true;
      this.header = 'Update raw material';
      //this.getRawMaterialById(this.rawMaterialId);
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

  createFormGroup(): void {
    this.recipeGroup = this.fb.group({
      name: [null, Validators.required],
      addedDate: [null, Validators.required],
      description: [null, Validators.required],
    });

  }

  private handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.Save:
      //  this.isEdit ? this.updateItem():  this.addRawMaterial();
        this.saveCloseValue = false;
        break;
      case ToolbarButtonType.Update:
        //this.handleUpdateButton();
        break;
      case ToolbarButtonType.SaveClose:
        this.saveCloseValue = true;
        // this.isEdit ? this.updateItem(): this.addRawMaterial();
        break;
      case ToolbarButtonType.Cancel:
        //this.saveClose();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
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
