import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgxEditorModule } from "ngx-editor";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { CookieService } from "ngx-cookie-service";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HeaderComponent } from "./header/header.component";
import { AngularMaterialModule } from "./material.module";
import { AllIssuesComponent } from "./issues/all-issues/all-issues.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { CreateIssueComponent } from "./dashboard/create-issue/create-issue.component";
import { IssueListComponent } from "./issues/all-issues/issue-list/issue-list.component";
import { IssueDetailComponent } from "./issues/all-issues/issue-detail/issue-detail.component";
import { AuthInterceptor } from "./auth/auth-interceptor";
import { ConfirmEqualValidatorDirective } from "./auth/signup/confirm-equal.validator.directive";
import { StartPageComponent } from "./issues/all-issues/start-page/start-page.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { ErrorInterceptor } from "./error.interceptor";
import { ErrorComponent } from "./error/error/error.component";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AllIssuesComponent,
    DashboardComponent,
    CreateIssueComponent,
    IssueListComponent,
    IssueDetailComponent,
    ConfirmEqualValidatorDirective,
    StartPageComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    NgxEditorModule,
    HttpClientModule,
    FlexLayoutModule,
  
  ],
  providers: [
    CookieService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ErrorComponent]
})
export class AppModule {}
