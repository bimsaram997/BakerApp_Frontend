import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, Subject, Subscription } from 'rxjs';
import { AutoCompleteType } from 'src/app/models/enum_collection/enumType';
import { AutoCompleteResult } from 'src/app/models/shared/menu';

@Component({
  selector: 'app-custom-autocomplete',
  templateUrl: './custom-autocomplete.component.html',
  styleUrls: ['./custom-autocomplete.component.css']
})
export class CustomAutocompleteComponent   implements OnInit, OnChanges, OnDestroy{
  subscription: Subscription[] = [];
  @Input() itemList: any;
  @Input() isProduct: boolean;
  @Input() label:string;
  @Input() type: AutoCompleteType;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  announcer = inject(LiveAnnouncer);
  @Output() rawMaterialIdList = new EventEmitter<AutoCompleteResult>();

  rawMaterialCtrl: FormControl;
  rawMaterialControl = new FormControl('');
  rawMaterials: any[] = [];
  rawMaterialIds: number[] = [];
  @ViewChild('rawMaterialInput') rawMaterialInput: ElementRef<HTMLInputElement>;
  filteredRawMaterials: Observable<any[]>;
  private filteredRawMaterialsSubject = new Subject<any[]>();
  allRawMaterials: any[];

  ngOnInit() {
    this.rawMaterialControl = new FormControl('', [Validators.required]);
    this.filteredRawMaterials = this.filteredRawMaterialsSubject.asObservable();


    this.subscription.push(this.rawMaterialControl.valueChanges.subscribe((value: any) => {
      if (value != '') {
        this._filterRawMaterials(value)
      }
    }));
  }
  getErrorMessage(): string {
    if (this.rawMaterialControl.hasError('required')) {
      return 'Selection is required';
    }
    return '';
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itemList'].currentValue?.length > 0) {
      const list: any[] = changes['itemList'].currentValue
      this.allRawMaterials = list;
      this.filteredRawMaterialsSubject.next(changes['itemList'].currentValue);
    }

  }


  onInputValueChanged() {
    // Check if rawMaterialInput is defined and if its value is empty
    if (this.rawMaterialInput && this.rawMaterialInput.nativeElement.value.trim() === '') {
      this.filteredRawMaterialsSubject.next(this.allRawMaterials);

    }
  }

  remove(rawMaterial: any): void {
    const index = this.rawMaterialIds.indexOf(rawMaterial.Id);
    if (index >= 0) {
      this.rawMaterialIds.splice(index, 1);
      this.emitAutoCompleteEvent();

      this.rawMaterials = this.rawMaterials.filter(material => material.Id !== rawMaterial.Id);
      this.announcer.announce(`Removed ${rawMaterial.Name}`);
    }
  }


  private emitAutoCompleteEvent(): void {
    switch (this.type) {
      case AutoCompleteType.RawMaterial:
        const resRawMaterial: AutoCompleteResult = { // Adjust type as per your AutoCompleteResult structure
          type: AutoCompleteType.RawMaterial,
          idList: this.rawMaterialIds
        };
        this.rawMaterialIdList.emit(resRawMaterial);
        break;
        case AutoCompleteType.Product:
        const resProducts: AutoCompleteResult = { // Adjust type as per your AutoCompleteResult structure
          type: AutoCompleteType.RawMaterial,
          idList: this.rawMaterialIds
        };
        this.rawMaterialIdList.emit(resProducts);
        break;
      // Add more cases for other AutoCompleteType values if needed
      default:
        break;
    }
  }
  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedValue = event.option.value;
    this.rawMaterialInput.nativeElement.value = '';
    this.rawMaterialControl.setValue(null);
    if (!this.rawMaterialIds.includes(selectedValue)) {
      this.rawMaterialIds.push(selectedValue);
      this.emitAutoCompleteEvent()
      const selectedRawMaterial = this.allRawMaterials.find(material => material.Id === selectedValue);
      if (selectedRawMaterial) {
        this.rawMaterials.push(selectedRawMaterial);

      }
    }

    this.filteredRawMaterialsSubject.next(this.allRawMaterials);

  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
     // this.rawMaterials.push(event);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.rawMaterialControl.setValue(null);
  }

  private _filterRawMaterials(value: string): void{
    if(value !== null) {
      const filterValue = value;
      const test = this.allRawMaterials.filter(rawMaterial => rawMaterial.Name.includes(filterValue));
      if(!test) {
        this.filteredRawMaterialsSubject.next(this.allRawMaterials);
      }
      this.filteredRawMaterialsSubject.next(test);
    } else {
      this.filteredRawMaterialsSubject.next(this.allRawMaterials);
    }

  }


  ngOnDestroy(): void {

    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });

  }
}
