import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { AllRawMaterialVM, PaginatedRawMaterials, QuantityType, RawMaterialListAdvanceFilter } from 'src/app/models/RawMaterials/RawMaterial';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RawMaterialService } from 'src/app/services/bakery/raw-material.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-raw-material-list',
  templateUrl: './raw-material-list.component.html',
  styleUrls: ['./raw-material-list.component.css']
})
export class RawMaterialListComponent implements OnInit, OnDestroy {
  header: string = 'Raw materials';
  subscription: Subscription[] = [];
  quantityTypes: any[] = [
    {MeasureUnit: 0, name: "Kg"}, {MeasureUnit: 1, name: "L"}
  ]
  searchRawMaterialForm: FormGroup;
  quantityType: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [ 'select', 'Name', 'MeasureUnit', 'Quantity', 'Price', 'Location', 'AddedDate', 'ModifiedDate'];
  dataSource = new MatTableDataSource<AllRawMaterialVM>();
  QuantityType = QuantityType; // Import the enum
  toolBarButtons: ToolbarButtonType[];
  selectedId: string | null = null;
  id: number
  getQuantityType(value: number): string {
    return QuantityType[value];
  }


  constructor(private toolbarService: ToolbarService,
    private router: Router,
    private fb: FormBuilder,
    private rawMaterialService:RawMaterialService
  ) {

  }
  ngOnInit() {
    this.searchFormGroup();
    this.toolbarService.updateToolbarContent(this.header);
    this.toolBarButtons = [ToolbarButtonType.New];
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
    this.getRawMaterialList();
    this.subscription.push(
      this.toolbarService.buttonClick$.subscribe((buttonType) => {
        if (buttonType) {
          this.handleButtonClick(buttonType);
        }
      })
    );

  }

  isSelected(id: string): boolean {
    this.id = +id;
    return this.selectedId === id;
  }

  checkboxChanged(event: MatCheckboxChange, id: string): void {
    if (event.checked) {
      // Check if Edit and Delete buttons are not already in the array
      const hasEditButton = this.toolBarButtons.includes(ToolbarButtonType.Edit);
      const hasDeleteButton = this.toolBarButtons.includes(ToolbarButtonType.Delete);

      // Add Edit and Delete buttons if they are not already present
      if (!hasEditButton) {
        this.toolBarButtons.push(ToolbarButtonType.Edit);
      }
      if (!hasDeleteButton) {
        this.toolBarButtons.push(ToolbarButtonType.Delete);
      }

      // Update custom buttons
      this.toolbarService.updateCustomButtons(this.toolBarButtons);
    } else {
      this.removeSpecificButtons();
    }

    // Rest of your logic remains the same
    if (this.selectedId === id) {
      // Uncheck the checkbox if it's already selected
      this.selectedId = null;
      this.id =  null;
    } else {
      // Check the checkbox and update selectedId
      this.selectedId = id;
      this.id = +id;
      console.log(this.selectedId); // Output the selected ID to console
    }

  }

  removeSpecificButtons(): void {
    const deleteIndex = this.toolBarButtons.indexOf(ToolbarButtonType.Delete);


    // Check if the buttons exist in the array before removing
    if (deleteIndex !== -1) {
      this.toolBarButtons.splice(deleteIndex, 1); // Remove Delete button
    }
    const editIndex = this.toolBarButtons.indexOf(ToolbarButtonType.Edit);
    if (editIndex !== -1) {
      this.toolBarButtons.splice(editIndex, 1); // Remove Edit button
    }
    this.toolbarService.updateCustomButtons(this.toolBarButtons);
  }
  searchFormGroup(): void {
    this.searchRawMaterialForm = this.fb.group({
      quantity: [null],
      measureUnit: [null],
      searchString: [null],
      addedDate: [null],
    });
  }

  private handleButtonClick(buttonType: ToolbarButtonType): void {
    switch (buttonType) {
      case ToolbarButtonType.New:
        this.handleNewButton();
        break;
      case ToolbarButtonType.Update:
        this.handleUpdateButton();
        break;
        case ToolbarButtonType.Edit:
        this.navigateToEditRawMaterial(this.id);
        break;
        case ToolbarButtonType.Delete:
        //this.handleUpdateButton();
        break;
      default:
        console.warn(`Unknown button type: ${buttonType}`);
    }
  }

  public getRawMaterialList(): void {
    this.dataSource.data =  null;
    const filter: RawMaterialListAdvanceFilter = {
      SortBy: this.sort?.active || 'Id',
      IsAscending: false,
      Quantity:  this.searchRawMaterialForm.get('quantity').value,
      MeasureUnit: this.searchRawMaterialForm.get('measureUnit').value,
      SearchString: this.searchRawMaterialForm.get('searchString').value,
      AddedDate: this.searchRawMaterialForm.get('addedDate').value ?? null,

      Pagination: {
        PageIndex: this.paginator?.pageIndex + 1 || 1,
        PageSize: this.paginator?.pageSize || 5,
      },
    };

    this.rawMaterialService.getRawMaterials(filter).subscribe((res: PaginatedRawMaterials) => {

      this.dataSource.data = res.Items;
      this.dataSource.paginator = this.paginator;
      this.paginator.length = res.TotalCount || 0; // Update paginator length
      this.dataSource.sort = this.sort;
    });
  }

  search(): void {
    this.getRawMaterialList();
  }

  clear(): void {
    this.searchRawMaterialForm.reset();
    this.getRawMaterialList();

  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      if (this.paginator) {
        this.paginator.pageIndex = 0; // Reset pageIndex when sorting
        this.getRawMaterialList();
      }
    });

    this.subscription.push(
      this.paginator.page.subscribe(() => this.getRawMaterialList())
    );
  }


  selectType(value: MatSelectChange): void{
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


  navigateToEditRawMaterial(id: number) {
    this.router.navigate(['base/rawMaterial/add', 'edit', id]);

  }

  private handleNewButton(): void {
    this.router.navigate(['base/rawMaterial/add', 'add']);
  }

  private handleUpdateButton(): void {
    console.log('Update button clicked - Dummy implementation');
    // Add your update logic here
  }

  ngOnDestroy(): void {
    this.toolbarService.updateCustomButtons([]);
    this.toolbarService.updateToolbarContent("");
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}
