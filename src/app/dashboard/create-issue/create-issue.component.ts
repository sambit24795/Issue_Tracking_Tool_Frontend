import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { AuthService } from "../../auth/auth.service";
import {
  Validators,
  FormControl,
  FormGroup,
  FormBuilder,
  NgForm
} from "@angular/forms";
import { IssueDashboardService } from "src/app/issue-dashboard.service";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { mimeType } from "./mime-type.validator";
import { from } from "rxjs";
import { WatcherService } from "src/app/issues/all-issues/watcher.service";

@Component({
  selector: "app-create-issue",
  templateUrl: "./create-issue.component.html",
  styleUrls: ["./create-issue.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class CreateIssueComponent implements OnInit {
  allStatus: any = ["Assigned", "In-Progress", "Completed"];
  assignedTo: any = [];
  ngxToolbar = [
    [
      "bold",
      "italic",
      "underline",
      "strikeThrough",
      "superscript",
      "subscript"
    ],
    ["fontName", "fontSize", "color"],
    [
      "justifyLeft",
      "justifyCenter",
      "justifyRight",
      "justifyFull",
      "indent",
      "outdent"
    ],
    ["cut", "copy", "delete", "removeFormat", "undo", "redo"],
    [
      "paragraph",
      "blockquote",
      "removeBlockquote",
      "orderedList",
      "unorderedList"
    ]
  ];
  form: FormGroup;
  isLoading = false;
  imagePreview: string | ArrayBuffer;
  private mode = "create";
  private issueId: string;
  public singleIssue: any;
  private userIdbyEmail: string;

  constructor(
    private IssueService: IssueDashboardService,
    private authservice: AuthService,
    public route: ActivatedRoute,
    public router: Router,
    private watcherservice: WatcherService
  ) {}

  ngOnInit() {
    this.getAssignedTo();
    this.form = new FormGroup({
      issueTitle: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      issueStatus: new FormControl(null, { validators: [Validators.required] }),
      issueDescription: new FormControl(null),
      issueAssignedTo: new FormControl(null, {
        validators: [Validators.required]
      }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("issueId")) {
        this.mode = "edit";
        this.issueId = paramMap.get("issueId");
        this.isLoading = true;
        this.IssueService.getIssue(this.issueId).subscribe(issueData => {
          this.isLoading = false;
          this.singleIssue = {
            id: issueData._id,
            issueTitle: issueData.issueTitle,
            issueDescription: issueData.issueDescription,
            issueStatus: issueData.issueStatus,
            issueAssignedTo: issueData.issueAssignedTo,
            issueDate: issueData.issueDate,
            imagePath: issueData.imagePath,
            creator: issueData.creator
          };
          this.form.setValue({
            issueTitle: this.singleIssue.issueTitle,
            issueDescription: this.singleIssue.issueDescription,
            issueAssignedTo: this.singleIssue.issueAssignedTo,
            issueStatus: this.singleIssue.issueStatus,
            image: this.singleIssue.imagePath
          });
        });
      } else {
        this.mode = "create";
        this.issueId = null;
      }
    });
  }

  private getAssignedTo() {
    this.authservice.getAllUsers();
    this.authservice.getUserUpdateListener().subscribe(userList => {
      const newArray = userList.map(fullname => fullname.email);
      // console.log('array',newArray);
      this.assignedTo = newArray;
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }
  onClose() {
    this.router.navigate(["/"]);
    this.form.reset();
  }

  onSaveIssue() {
    const date = new Date();
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      const post = {
        issueTitle: this.form.value.issueTitle,
        issueDescription: this.form.value.issueDescription,
        issueStatus: this.form.value.issueStatus,
        issueAssignedTo: this.form.value.issueAssignedTo,
        issueDate: date.toLocaleString(),
        image: this.form.value.image
      };

      this.IssueService.addIssues(
        post.issueTitle,
        post.issueStatus,
        post.issueAssignedTo,
        post.issueDescription,
        post.issueDate,
        post.image
      );
    } else {
      const editedDate = date.toLocaleString();
      this.IssueService.updateIssue(
        this.form.value.issueTitle,
        this.form.value.issueStatus,
        this.form.value.issueAssignedTo,
        this.form.value.issueDescription,
        editedDate,
        this.issueId,
        this.form.value.image
      );
    }

    this.form.reset();
  }
}
