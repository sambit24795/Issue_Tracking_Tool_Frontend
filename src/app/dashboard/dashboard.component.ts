import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import { MatTableDataSource, MatPaginator, MatSort } from "@angular/material";
import { IssueDashboardService } from "../issue-dashboard.service";
import { Subscription, from } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { DataSource } from "@angular/cdk/table";
import { Issue } from "../Issue.model";
import { NotificationService } from "../header/notification.service";

export interface PeriodicElement {
  title: string;
  status: number;
  reporter: number;
  date: string;
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ["title", "status", "reporter", "date"];
  dataSource = new MatTableDataSource();
  isLoading = false;
  private issueSub: Subscription;
  userId: string;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  constructor(
    private issueServie: IssueDashboardService,
    private authServce: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.userId = this.authServce.getUserId();
    this.isLoading = true;
    this.issueServie.getIssues();
    this.issueSub = this.issueServie
      .getPostUpdateListener()
      .subscribe((issue: any[]) => {
        this.isLoading = false;
        this.dataSource.data = issue;
        setTimeout(() => (this.dataSource.paginator = this.paginator));
        setTimeout(() => (this.dataSource.sort = this.sort));

        this.userId = this.authServce.getUserId();
      });
  }

  ngOnDestroy() {
    this.issueSub.unsubscribe();
  }
}
