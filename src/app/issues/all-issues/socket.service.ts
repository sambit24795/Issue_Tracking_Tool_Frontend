import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { HttpClient } from "@angular/common/http";
import { CookieService } from "ngx-cookie-service";
import { Observable, observable } from "rxjs";


@Injectable({
  providedIn: "root"
})
export class SocketService {
  private baseUrl = "http://issuetrackingapp-env.kdtn4q88sh.us-east-2.elasticbeanstalk.com/";
  private socket; 
  constructor(private http: HttpClient, private Cookie: CookieService) {
    this.socket = io(this.baseUrl);
  }

  OnMessage(data: any) {
    this.socket.emit("message", data);
  }

  onComment() {
    let observable = new Observable<any>(observer => {
      this.socket.on("comment", data => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  onGetData(data: any) {
    this.socket.emit("getData", data);
  }

  onDisplay() {
    let observable = new Observable<any>(observer => {
      this.socket.on("display", data => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  onGetNotification(data: any) {
    this.socket.emit("getNotification", data);
  }

  onShow() {
    let observable = new Observable<any>(observer => {
      this.socket.on("showToall", data => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }
}
