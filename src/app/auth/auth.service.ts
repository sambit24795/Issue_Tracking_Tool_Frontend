import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { CookieService } from "ngx-cookie-service";

import { AuthData } from "./auth-data.model";
import { Subject } from "rxjs";
import { Router, ActivatedRoute } from "@angular/router";

import { environment } from "../../environments/environment";

const BACKEND_URL = environment.apiUrl + "/user/";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private token: string;
  private authListener = new Subject<boolean>();
  private isAuthenticated = false;
  private tokenTimer: any;
  private users: any = [];
  private userSubject = new Subject<any>();
  private userId: string;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookie: CookieService,
    private route: ActivatedRoute
  ) {}

  getToken() {
    return this.token;
  }

  getAuthStatus() {
    return this.authListener.asObservable();
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  createUser(fullName: string, email: string, password: string) {
    const authData: AuthData = {
      fullName: fullName,
      password: password,
      email: email
    };
    this.http.post(BACKEND_URL + "signup", authData).subscribe(
      response => {
        this.router.navigate(["auth/login"]);
      },
      error => {
        this.authListener.next(false);
      }
    );
  }

  getUserUpdateListener() {
    return this.userSubject.asObservable();
  }

  getAllUsers() {
    this.http
      .get<{ message: string; user: any }>(BACKEND_URL)
      .subscribe(response => {
        this.users = response.user;
        this.userSubject.next([...this.users]);
      });
  }

  getUserId() {
    return this.userId;
  }

  getUserbyEmail(email: string) {
    return this.http.get<any>(BACKEND_URL + email);
  }

  loginUser(email: string, password: string) {
    const authData = { password: password, email: email };
    this.http
      .post<{
        token: string;
        message: string;
        expiresIn: number;
        userId: string;
        email: string;
      }>(BACKEND_URL + "login", authData)
      .subscribe(
        response => {
          const token = response.token;
          this.token = token;

          if (token) {
            const expireDuration = response.expiresIn;
            this.setAuthTimer(expireDuration);
            //console.log(expireDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.authListener.next(true);
            const now = new Date();
            const expiresInDuration = new Date(
              now.getTime() + expireDuration * 1000
            );
            this.saveAuthData(token, expiresInDuration, this.userId, email);

            this.router.navigate(["/"], { relativeTo: this.route });
          }
        },
        error => {
          this.authListener.next(false);
        }
      );
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expireDuration.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.authListener.next(false);
    clearTimeout(this.tokenTimer);
    this.userId = null;
    this.clearAuthData();
    this.router.navigate(["auth/login"]);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(
    token: string,
    expiresInDuration: Date,
    userId: string,
    email: string
  ) {
    this.cookie.set("token", token);
    this.cookie.set("expiration", expiresInDuration.toISOString());
    this.cookie.set("userId", userId);
    this.cookie.set("email", email);
  }

  private clearAuthData() {
    this.cookie.delete("token");
    this.cookie.delete("expiration");
    this.cookie.delete("userId");
    this.cookie.delete("email");
    this.cookie.delete("authtoken");
    this.cookie.deleteAll();
  }

  private getAuthData() {
    const token = this.cookie.get("token");
    const expiresInDuration = this.cookie.get("expiration");
    const userId = this.cookie.get("userId");

    if (!token || !expiresInDuration) {
      return;
    }
    return {
      token: token,
      expireDuration: new Date(expiresInDuration),
      userId: userId
    };
  }
}
