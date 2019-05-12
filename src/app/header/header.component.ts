import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { from, Subscription } from "rxjs";
import { IssueDashboardService } from "../issue-dashboard.service";
import { MatDialog, MatDialogConfig, MatSnackBar } from "@angular/material";
import { NotificationService } from "./notification.service";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { ErrorComponent } from "../error/error/error.component";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private authSub: Subscription;
  badgeNumber: number;
  notificationArray: any;
  dataArray: any;
  index: any = [];
  email: string;
  durationInSeconds = 3;

  constructor(
    private authService: AuthService,
    private issueService: IssueDashboardService,
    private rourter: Router,
    private notificationService: NotificationService,
    private cookie: CookieService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.notificationService.getBadgeNumber();
    this.notificationService.badgeNoListener().subscribe(badgeNo => {
      this.badgeNumber = badgeNo;
      this.email = this.cookie.get("email").split("@")[0];
      //console.log(badgeNo)
    });
    this.notificationService.getNotifications();
    this.notificationService.notificationListener().subscribe(data => {
      //const notifications = data.map((notification) => notification.notification);
      this.notificationArray = data;

      // console.log('all-data',data);
      // this.badgeNumber = data.length;
      this.issueService.getPostUpdateListener();
    });

    this.isAuthenticated = this.authService.getIsAuth();
    this.authSub = this.authService
      .getAuthStatus()
      .subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
      });
  }
  onClick(index: string) {
    const newIndex = this.issueService.getIssuebyid(index);
    if (newIndex == -1) {
      this.snackBar.openFromComponent(ErrorComponent, {
        duration: this.durationInSeconds * 1000,
        data: { message: "issue doesn't exist anymore!!" },
        panelClass: ["error"]
      });
      this.rourter.navigate(["/allIssues"]);
    } else {
      this.rourter.navigate(["/allIssues", newIndex]);
    }
  }
  onClose(notificationId: string) {
    this.notificationService.deleteNotification(notificationId);
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
