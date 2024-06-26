import { Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Subscription, catchError } from 'rxjs';
import { MasterDataService } from '../../../services/bakery/master-data.service';
import { EnumType } from '../../../models/enum_collection/enumType';
import { AllMasterData, MasterDataVM } from '../../../models/MasterData/MasterData';
import { ResultView } from 'src/app/models/ResultView';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-address-lookup',
  templateUrl: './address-lookup.component.html',
  styleUrls: ['./address-lookup.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressLookupComponent),
      multi: true
    }
  ]
})
export class AddressLookupComponent implements ControlValueAccessor, OnInit, OnDestroy{
  @Input() addressForm: any;
  subscription: Subscription[] = [];
  countries: MasterDataVM[];

  constructor(private fb: FormBuilder,
    private masterDataService: MasterDataService,
    private toastr: ToastrService,
  ) {
    this.addressForm = this.fb.group({
      street1: ['', Validators.required],
      street2: [''],
      city: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: [
        null,
        [
          Validators.required,
          Validators.pattern("^[0-9]*$"),

        ],
      ],
    });
  }

  ngOnInit(): void {
    this.getCountries();
    this.addressForm.valueChanges.subscribe(value => {
      this.onChange(value);
      this.onTouched();
      this.writeValue(value)
    });
  }

  public getCountries(): void {
    try {
      const resultResponse = this.masterDataService.getMasterDataByEnumTypeId(EnumType.Countries);
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
              this.countries = res.Item.Items;
            }
          })
      );
    } catch (error) {
      console.error('An error occurred while attempting to load master data:', error);
    }

  }

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    if (value) {
      this.addressForm.setValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.addressForm.disable();
    } else {
      this.addressForm.enable();
    }
  }
  ngOnDestroy(): void {
    this.subscription.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

}
