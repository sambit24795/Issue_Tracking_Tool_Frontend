import { Component, OnInit, OnDestroy } from "@angular/core";
import { IssueDashboardService } from "src/app/issue-dashboard.service";
import { Issue } from "../../Issue.model";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-all-issues",
  templateUrl: "./all-issues.component.html",
  styleUrls: ["./all-issues.component.css"]
})
export class AllIssuesComponent implements OnInit, OnDestroy {
  allIssues: any;
  private issueSub: Subscription;
  isLoading = true;

  constructor(
    private issueService: IssueDashboardService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.issueService.getIssues();
    this.issueSub = this.issueService
      .getPostUpdateListener()
      .subscribe(issues => {
        this.isLoading = false;
        this.allIssues = issues;
      });
  }
  ngOnDestroy() {
    this.issueSub.unsubscribe();
  }
}
