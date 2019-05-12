import { Component, OnInit } from "@angular/core";
import { IssueDashboardService } from "../../../issue-dashboard.service";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { Subscription, from } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { SocketService } from "../socket.service";
import { CookieService } from "ngx-cookie-service";
import { WatcherService } from "../watcher.service";

@Component({
  selector: "app-issue-detail",
  templateUrl: "./issue-detail.component.html",
  styleUrls: ["./issue-detail.component.css"]
})
export class IssueDetailComponent implements OnInit {
  public index: number;
  singleIssue: any;
  userId: string;
  singleComment: string = "";
  cookieUserId: string;
  commentData: any;
  savedData: any;
  allWatchers: any;

  oldId: any = "";

  constructor(
    private issueService: IssueDashboardService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private socketService: SocketService,
    private cookie: CookieService,
    private watcherService: WatcherService
  ) {}

  ngOnInit() {
    this.onDisplayData();
    //this.onConnection();
    this.userId = this.authService.getUserId();
    this.route.paramMap.subscribe((id: ParamMap) => {
      this.index = +id.get("id");
      this.savedData = [];

      this.singleIssue = this.issueService.getSingleIssue(this.index);
      this.userId = this.authService.getUserId();
      this.getData();
    });
  }

  onConnection() {
    this.socketService.onComment().subscribe(data => {
      const newData = data.map(id => id.issueId);
      const singleData = this.singleIssue.id;
      this.oldId = newData[0];
      if (this.oldId === singleData) {
        this.savedData = data;
      } else {
        this.savedData = [];
      }
    });
  }

  onWatcher() {
    this.watcherService.addWatchers(
      this.singleIssue.id,
      this.authService.getUserId(),
      this.cookie.get("email")
    );
  }

  getWatchers(issueId: string) {
    this.watcherService.getWatchers(issueId).subscribe(watchers => {
      const watcherList = watchers.data.map(fullName => fullName.email);
      this.allWatchers = watcherList;
    });
  }

  onComment() {
    this.socketService.OnMessage({
      email: this.cookie.get("email").split("@")[0],
      comment: this.singleComment,
      issueId: this.singleIssue.id
    });

    this.singleComment = "";
    this.getData();
  }

  getData() {
    this.socketService.onGetData({
      email: this.cookie.get("email").split("@")[0],
      comment: this.singleComment,
      issueId: this.singleIssue.id
    });
  }

  onDisplayData() {
    this.socketService.onDisplay().subscribe(data => {
      // console.log('displayData', data);
      this.commentData = data;
    });
  }

  onDelete(id: string) {
    this.issueService.deleteIssue(id);
    this.router.navigate(["/allIssues"]);
  }
}
