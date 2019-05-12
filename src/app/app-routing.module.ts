import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CreateIssueComponent } from "./dashboard/create-issue/create-issue.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AllIssuesComponent } from "./issues/all-issues/all-issues.component";
import { IssueDetailComponent } from "./issues/all-issues/issue-detail/issue-detail.component";
import { AuthGuard } from "./auth/auth.guard";

import { StartPageComponent } from "./issues/all-issues/start-page/start-page.component";

const routes: Routes = [
  {
    path: "createIssue",
    component: CreateIssueComponent,
    canActivate: [AuthGuard]
  },
  { path: "", component: DashboardComponent, canActivate: [AuthGuard] },
  {
    path: "editIssue/:issueId",
    component: CreateIssueComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "allIssues",
    component: AllIssuesComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "", component: StartPageComponent },
      { path: ":id", component: IssueDetailComponent }
    ]
  },
  { path: "auth", loadChildren: "./auth/auth.module#AuthModule" },
  { path: "**", redirectTo: "auth/login" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {}
