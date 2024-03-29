import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ConfirmEqualValidatorDirective } from "./confirm-equal.validator.directive";

import { AuthService } from "../auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"]
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authStatusSub: Subscription;

  constructor(private authservice: AuthService) {}

  ngOnInit() {
    this.authStatusSub = this.authservice
      .getAuthStatus()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
  }

  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    } else {
      this.isLoading = true;
      this.authservice.createUser(
        form.value.fullName,
        form.value.email,
        form.value.password
      );
    }
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
