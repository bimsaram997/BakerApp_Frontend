import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToolbarButtonType } from '../../models/enum_collection/toolbar-button';

@Injectable({
  providedIn: 'root',
})
export class ToolbarService implements OnDestroy {
  private toolbarContentSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public toolbarContent$: Observable<string> = this.toolbarContentSubject.asObservable();

  private customButtonsSubject: BehaviorSubject<ToolbarButtonType[]> = new BehaviorSubject<ToolbarButtonType[]>([]);
  private enableButtonsSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public customButtons$: Observable<ToolbarButtonType[]> = this.customButtonsSubject.asObservable();
  public enableButtons$: Observable<boolean> = this.enableButtonsSubject.asObservable();

  private buttonClickSubject: Subject<ToolbarButtonType> = new Subject<ToolbarButtonType>();
  public buttonClick$: Observable<ToolbarButtonType> = this.buttonClickSubject.asObservable();

  // Subject to signal to subscriptions to unsubscribe
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor() {}

  updateToolbarContent(content: string): void {
    this.toolbarContentSubject.next(content);
  }

  updateCustomButtons(buttons: ToolbarButtonType[]): void {
    this.customButtonsSubject.next(buttons);
  }

  enableButtons(value: boolean): void {
    this.enableButtonsSubject.next(value);
  }


  handleButtonClick(buttonType: ToolbarButtonType): void {
    this.buttonClickSubject.next(buttonType);
  }



  // Method to unsubscribe from all subscriptions
  unsubscribeAll(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Implementing OnDestroy interface to automatically unsubscribe when the service is destroyed
  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  // Method to subscribe to button clicks with automatic unsubscription
  subscribeToButtonClick(handler: (buttonType: ToolbarButtonType) => void): void {
    this.buttonClick$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(handler);
  }


}
