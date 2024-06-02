import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';

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
export class AddressLookupComponent implements ControlValueAccessor, OnInit{
  @Input() addressForm: any;
  countries: any[] = [
    {Id: 0, name: "Sri Lanka"}, {Id: 1, name: "Finland"}
  ];

  constructor(private fb: FormBuilder) {
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
    this.addressForm.valueChanges.subscribe(value => {
      this.onChange(value);
      this.onTouched();
      this.writeValue(value)
    });
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
}
