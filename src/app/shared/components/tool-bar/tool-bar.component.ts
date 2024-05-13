import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToolbarButtonType } from '../../../models/enum_collection/toolbar-button';
import { ToolbarService } from '../../../services/layout/toolbar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent {
  @Output() buttonClick: EventEmitter<ToolbarButtonType> = new EventEmitter<ToolbarButtonType>();
  toolbarContent: string = '';
  customButtons: ToolbarButtonType[] = [];
  private subscription: Subscription;

  // Property to track disabled buttons
  disabledButtons: Set<ToolbarButtonType> = new Set();
  enabledButtons: Set<ToolbarButtonType> = new Set();
  isEnable: boolean;

  constructor(private toolbarService: ToolbarService) {
    this.subscription = this.toolbarService.toolbarContent$.subscribe((content: string) => {
      this.toolbarContent = content;
    });

    this.subscription.add(this.toolbarService.customButtons$.subscribe((buttons: ToolbarButtonType[]) => {
      this.customButtons = buttons;
    }));

    this.subscription.add(this.toolbarService. enableButtons$.subscribe((value: boolean) => {
      this.isEnable = value;

    }));

  }


  handleButtonClick(buttonType: ToolbarButtonType): void {
    this.buttonClick.emit(buttonType);
    this.initializeDisabledButtons();
  }

  // Method to initialize disabled buttons
  initializeDisabledButtons(): void {
    this.disabledButtons.add(ToolbarButtonType.Save);
    this.disabledButtons.add(ToolbarButtonType.SaveClose);
  }

  isButtonDisabled(buttonType: ToolbarButtonType): boolean {
    if (this.isEnable) {
      return false;
    } else {
      // Check if the button type is present in the disabledButtons set
      return this.disabledButtons.has(buttonType);
    }
  }

  getButtonColorClass(buttonType: ToolbarButtonType): string {
    switch(buttonType) {
      case ToolbarButtonType.Save:
        return 'primary';
      case ToolbarButtonType.Update:
        return 'primary';
        case ToolbarButtonType.Delete:
          return 'warn';
      case ToolbarButtonType.New:
        return 'primary';
      case ToolbarButtonType.Cancel:
        return '';
      case ToolbarButtonType.SaveClose:
        return 'primary';
      default:
        return ''; // Default color class
    }
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
