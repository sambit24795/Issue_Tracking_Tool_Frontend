import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import { NotificationService } from "./header/notification.service";
import { MatSnackBar } from "@angular/material";
import { ErrorComponent } from "./error/error/error.component";
import { WatcherService } from "./issues/all-issues/watcher.service";
import { AuthService } from "./auth/auth.service";
import { SocketService } from "./issues/all-issues/socket.service";
import { environment } from "../environments/environment";
import { CookieService } from "ngx-cookie-service";

const BACKEND_URL = environment.apiUrl + "/issues/";

@Injectable({
  providedIn: "root"
})
export class IssueDashboardService {
  private posts: any = [];
  private postsUpdated = new Subject<any>();
  durationInSeconds = 3;
  userIdbyEmail: any;
  assignedEmail: string;
  assignedIssueid: any;
  notificationData: string;

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private socketservie: SocketService,
    private watcherservice: WatcherService,
    private authservice: AuthService,
    private cookie: CookieService
  ) {}

  getIssues() {
    this.http
      .get<{ message: string; issues: any }>(BACKEND_URL)
      .pipe(
        map(data => {
          return data.issues.map(issue => {
            return {
              issueTitle: issue.issueTitle,
              issueStatus: issue.issueStatus,
              issueAssignedTo: issue.issueAssignedTo,
              issueDescription: issue.issueDescription,
              issueDate: issue.issueDate,
              id: issue._id,
              imagePath: issue.imagePath,
              creator: issue.creator,
              reporter: issue.creatorName
            };
          });
        })
      )
      .subscribe(transfomredIssue => {
        this.posts = transfomredIssue;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getSingleIssue(index: number) {
    return this.posts[index];
  }

  getIssuebyid(id: string) {
    return this.posts.findIndex(data => data.id === id);
  }

  getIssue(id: string) {
    //return {...this.posts.find(p => p.id === id)};
    return this.http.get<any>(BACKEND_URL + id);
  }

  updateIssue(
    title: string,
    status: string,
    assignedTo: string,
    description: string,
    date: any,
    id: string,
    image: File | string
  ) {
    let issueData: any;
    if (typeof image === "object") {
      issueData = new FormData();
      issueData.append("id", id);
      issueData.append("issueTitle", title);
      issueData.append("issueStatus", status);
      issueData.append("issueAssignedTo", assignedTo);
      issueData.append("issueDescription", description);
      issueData.append("issueDate", date);
      issueData.append("image", image, title);
    } else {
      issueData = {
        id: id,
        issueTitle: title,
        issueStatus: status,
        issueAssignedTo: assignedTo,
        issueDescription: description,
        issueDate: date,
        imagePath: image,
        creator: null
      };
    }

    this.http
      .put<{ userId: string; message: string }>(BACKEND_URL + id, issueData)
      .subscribe(response => {
        const updatedIssue = [...this.posts];
        const oldIndex = updatedIssue.findIndex(p => p.id === id);
        const editedIssue = {
          id: id,
          issueTitle: title,
          issueStatus: status,
          issueAssignedTo: assignedTo,
          issueDescription: description,
          issueDate: date,
          imagePath: ""
        };
        this.socketservie.onGetNotification({ data: response.message });
        this.socketservie.onShow().subscribe(data => {
          this.snackBar.openFromComponent(ErrorComponent, {
            duration: this.durationInSeconds * 1000,
            data: { message: data.data },
            panelClass: ["warning"],
            verticalPosition: "top"
          });
        });

        this.notificationService.postNotifications(
          editedIssue.id,
          response.userId,
          response.message
        );
        updatedIssue[oldIndex] = editedIssue;
        this.posts = updatedIssue;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addIssues(
    title: string,
    status: string,
    assignedTo: string,
    description: string,
    date: any,
    image: File
  ) {
    const issueData = new FormData();
    issueData.append("issueTitle", title);
    issueData.append("issueStatus", status);
    issueData.append("issueAssignedTo", assignedTo);
    issueData.append("issueDescription", description);
    issueData.append("issueDate", date);
    issueData.append("image", image, title);

    this.http
      .post<{ message: string; issue: any }>(BACKEND_URL, issueData)
      .subscribe(data => {
        const post = {
          id: data.issue.id,
          issueTitle: title,
          issueAssignedTo: assignedTo,
          issueDescription: description,
          issueStatus: status,
          issueDate: data,
          imagePath: data.issue.imagePath
        };
        this.assignedIssueid = data.issue.id;
        this.assignedEmail = assignedTo;
        this.watcherservice.addWatchers(
          data.issue.id,
          data.issue.creator,
          this.cookie.get("email")
        );
        this.authservice.getUserbyEmail(assignedTo).subscribe(data => {
          this.userIdbyEmail = data.userData._id;
          this.watcherservice.addWatchers(
            this.assignedIssueid,
            this.userIdbyEmail,
            this.assignedEmail
          );
        });
        this.socketservie.onGetNotification({ data: data.message });
        this.socketservie.onShow().subscribe(data => {
          this.snackBar.openFromComponent(ErrorComponent, {
            duration: this.durationInSeconds * 1000,
            data: { message: data.data },
            panelClass: ["success"],
            verticalPosition: "top"
          });
        });

        this.notificationService.postNotifications(
          data.issue.id,
          data.issue.creator,
          data.message
        );

        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);

        this.router.navigate(["/"]);
      });
  }

  deleteIssue(issueId: string) {
    this.http
      .delete<{ message: string; userId: string }>(BACKEND_URL + issueId)
      .subscribe(response => {
        this.socketservie.onGetNotification({ data: response.message });
        this.socketservie.onShow().subscribe(data => {
          this.snackBar.openFromComponent(ErrorComponent, {
            duration: this.durationInSeconds * 1000,
            data: { message: data.data },
            panelClass: ["delete"],
            verticalPosition: "top"
          });
        });

        this.notificationService.postNotifications(
          issueId,
          response.userId,
          response.message
        );
        const updatedIssue = this.posts.filter(issue => issue.id !== issueId);
        this.posts = updatedIssue;
        this.postsUpdated.next([...this.posts]);
      });
  }
}
