import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginServiceService } from '../../../services/bakery/login-service.service'
import { LoginRequest } from '../../../models/Authorization/Authorization';
import { AuthService } from '../../../services/bakery/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent  implements OnInit, OnDestroy {
  loginForm: FormGroup;
  subscription: Subscription[] = [];

  constructor(private router: Router,
    private fb: FormBuilder,
    private loginService: LoginServiceService,
    private authService: AuthService,
  ) {

  }

  ngOnInit() {
    this.createFormGroup();
  }

  createFormGroup(): void {
    this.loginForm = this.fb.group({
      email: [null, Validators.required],
      password: [null, Validators.required],

    });

  }


  navigate(): void {
    this.router.navigate(['base/']);
  }

  loginRequest() {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();


    });

    if(this.loginForm.valid) {

      try {


        const formData = this.loginForm.value;
        const loginRequest: LoginRequest = {
          Email: formData.email,
          Password:formData.password

        };
        const updateResponse = this.loginService.login( loginRequest);
        this.subscription.push(updateResponse.subscribe((res: any) => {
          if (res != null) {
            this.authService.setToken(res.Token);
            this.router.navigate(['base/']);
          }
        }));

      }catch (error) {

        console.error('An error occurred while updating the food item:', error);

      }
    }
  }


  ngOnDestroy(): void {}
}
