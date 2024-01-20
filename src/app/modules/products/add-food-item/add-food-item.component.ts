import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { ToolbarButtonType } from 'src/app/models/enum_collection/toolbar-button';

@Component({
  selector: 'app-add-food-item',
  templateUrl: './add-food-item.component.html',
  styleUrls: ['./add-food-item.component.css'],
})
export class AddFoodItemComponent implements OnInit, OnDestroy {
  subscription: Subscription[] = [];
  header: string;
  mode: string;
  productId: number;
  columns: string[] = ['Column 1', 'Column 2', 'Column 3', 'Column 4', 'Column 5', 'Column 5','Column 5','Column 5',];
  rows: number[] = Array.from({ length: 15 }, (_, index) => index + 1);
  constructor(
    private route: ActivatedRoute,
    private toolbarService: ToolbarService
  ) {}
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.mode = params['mode'];
      this.productId = +params['id'];
    });
    if (this.mode === 'edit') {
      this.header = 'Edit food item';
      this.toolbarService.updateCustomButtons([ToolbarButtonType.Update]);
    } else {
      this.header = 'Add food item';
      this.toolbarService.updateCustomButtons([ToolbarButtonType.Save]);
    }

    this.toolbarService.updateToolbarContent(this.header);
  }
  ngOnDestroy(): void {
    this.toolbarService.updateCustomButtons([]);
    this.toolbarService.updateToolbarContent('');
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}
