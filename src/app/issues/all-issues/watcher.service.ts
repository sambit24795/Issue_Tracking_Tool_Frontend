import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

const BACKEND_URL = environment.apiUrl + "/watcher/";

@Injectable({
  providedIn: "root"
})
export class WatcherService {
  constructor(private http: HttpClient) {}

  addWatchers(issueid: string, userId: any, email: string) {
    const issueId = { issueId: issueid, userId: userId, email:email };
    this.http.post<any>(BACKEND_URL, issueId).subscribe(data => {
    });
  }

  getWatchers(issueId: string) {
    return this.http.get<any>(BACKEND_URL + issueId);
  }
}
