import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Issue } from "../../../Issue.model";

@Component({
  selector: "app-issue-list",
  templateUrl: "./issue-list.component.html",
  styleUrls: ["./issue-list.component.css"]
})
export class IssueListComponent implements OnInit {
  @Input() issue: any;
  @Input() index: number;

  constructor() {}

  ngOnInit() {}
}
