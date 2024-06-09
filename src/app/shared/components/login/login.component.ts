import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, catchError } from 'rxjs';
import { LoginServiceService } from '../../../services/bakery/login-service.service'
import { LoginRequest } from '../../../models/Authorization/Authorization';
import { AuthService } from '../../../services/bakery/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    private toastr: ToastrService,
    private snackBar: MatSnackBar
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

    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      const loginRequest: LoginRequest = {
        Email: formData.email,
        Password: formData.password
      };

      try {
        const updateResponse = this.loginService.login(loginRequest);
        this.subscription.push(updateResponse.pipe(
          catchError(error => {
            this.toastr.error('Error!', error.error.Message);
            return error;
          })
        ).subscribe((res: any) => {
          if (res != null) {
            this.authService.setToken(res.Token);
            this.router.navigate(['base/']);
          }
        }));
      } catch (error) {
        console.error('An error occurred while attempting to log in:', error);
      }
    }
  }



  showErrorMessage(message: string) {
    // Implement your error message display logic here
    alert(message); // Example using alert, you can use a more user-friendly way
  }



  ngOnDestroy(): void {}
}
