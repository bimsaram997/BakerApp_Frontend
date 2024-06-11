import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RecipeService } from '../../../services/bakery/reipe.service';
import {
  RecipeListAdvanceFilter,
  AllRecipeVM,
  PaginatedRecipes,
} from '../../../models/Recipe/Recipe';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { RawMaterialService } from '../../../services/bakery/raw-material.service';
import { RawMaterialListSimpleVM } from 'src/app/models/RawMaterials/RawMaterial';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ResultView } from 'src/app/models/ResultView';
@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
})
export class RecipeListComponent implements OnInit, OnDestroy {
  header: string = 'Recipes';
  subscription: Subscription[] = [];
  toolBarButtons: ToolbarButtonType[];
  searchRecipeForm: FormGroup;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [
    'select',
    'RecipeName',
    'Description',
    'RawMaterial',
    'AddedDate',
    'ModifiedDate',
    'Instructions',
  ];
  dataSource = new MatTableDataSource<AllRecipeVM>();
  selectedId: string | null = null;
  id: number;
  rawMaterialList: RawMaterialListSimpleVM[];
  constructor(
    private toolbarService: ToolbarService,
    private router: Router,
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private rawMaterialService: RawMaterialService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.searchFormGroup();
    this.getListRawMaterials();
    this.toolbarService.updateToolbarContent(this.header);
    this.toolBarButtons = [ToolbarButtonType.New];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
    this.getRecipeList();
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

  isSelected(id: string): boolean {
    this.id = +id;
    return this.selectedId === id;
  }

  checkboxChanged(event: MatCheckboxChange, id: string): void {
    if (event.checked) {
      const hasEditButton = this.toolBarButtons.includes(
        ToolbarButtonType.Edit
      );
      const hasDeleteButton = this.toolBarButtons.includes(
        ToolbarButtonType.Delete
      );
      if (!hasEditButton) {
        this.toolBarButtons.push(ToolbarButtonType.Edit);
      }
      if (!hasDeleteButton) {
        this.toolBarButtons.push(ToolbarButtonType.Delete);
      }
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
    } else {
      this.removeSpecificButtons();
    }
    if (this.selectedId === id) {
      this.selectedId = null;
      this.id = null;
    } else {
      this.selectedId = id;
      this.id = +id;
      console.log(this.selectedId);
    }
  }

  removeSpecificButtons(): void {
    const deleteIndex = this.toolBarButtons.indexOf(ToolbarButtonType.Delete);
    if (deleteIndex !== -1) {
      this.toolBarButtons.splice(deleteIndex, 1);
    }
    const editIndex = this.toolBarButtons.indexOf(ToolbarButtonType.Edit);
    if (editIndex !== -1) {
      this.toolBarButtons.splice(editIndex, 1);
    }
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
  }

  public handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.New:
        this.handleNewButton();
        break;
      case ToolbarButtonType.Update:
        // this.handleUpdateButton();
        break;
      case ToolbarButtonType.Edit:
        this.navigateToEditRecipe(this.id);
        break;
      case ToolbarButtonType.Delete:
        //this.handleUpdateButton();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }

  searchFormGroup(): void {
    this.searchRecipeForm = this.fb.group({
      description: [null],
      rawMaterialIds: [null],
      searchString: [null],
      addedDate: [null],
    });
  }

  public getRecipeList(): void {
    this.dataSource.data = null;
    const filter: RecipeListAdvanceFilter = {
      SortBy: this.sort?.active || 'Id',
      IsAscending: false,
      Description: this.searchRecipeForm.get('description').value,
      RawMaterialIds: this.searchRecipeForm.get('rawMaterialIds').value,
      SearchString: this.searchRecipeForm.get('searchString').value,
      AddedDate: this.searchRecipeForm.get('addedDate').value ?? null,

      Pagination: {
        PageIndex: this.paginator?.pageIndex + 1 || 1,
        PageSize: this.paginator?.pageSize || 5,
      },
    };

    this.recipeService
      .getRecipes(filter)
      .subscribe((res:  ResultView<PaginatedRecipes>) => {
        this.dataSource.data = res.Item.Items;
        this.dataSource.paginator = this.paginator;
        this.paginator.length = res.Item.TotalCount || 0;
        this.dataSource.sort = this.sort;
      });
  }

  private handleNewButton(): void {
    this.router.navigate(['base/recipe/add', 'add']);
  }

  search(): void {
    this.getRecipeList();
  }

  clear(): void {
    this.searchRecipeForm.reset();
    this.getRecipeList();
  }

  navigateToEditRecipe(id: number) {
    this.router.navigate(['base/recipe/add', 'view', id]);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      if (this.paginator) {
        this.paginator.pageIndex = 0;
        this.getRecipeList();
      }
    });

    this.subscription.push(
      this.paginator.page.subscribe(() => this.getRecipeList())
    );
  }

  removeHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  getSanitizedContent(htmlContent: string): SafeHtml {
    const smallPart = htmlContent.substring(0, 50);
    return this.sanitizer.bypassSecurityTrustHtml(smallPart);
  }

  ngOnDestroy(): void {
    this.toolbarService.updateCustomButtons([]);
    this.toolbarService.updateToolbarContent('');
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}
