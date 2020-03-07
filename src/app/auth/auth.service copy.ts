import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { auth } from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';


import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';


import { environment } from '../../environments/environment';
import { User } from './user.model';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  // tslint:disable-next-line: variable-name
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;

  // get userIsAuthenticated() {
  //   return this._user.asObservable().pipe(map(user => {
  //     if (user) {
  //       return !!user.token;
  //     } else {
  //       return false;
  //     }
  //   }));
  // }

  // get userId() {
  //   return this._user.asObservable().pipe(map(user => {
  //       if (user) {
  //         return user.id;
  //       } else {
  //         return null;
  //       }
  //     })
  //   );
  // }

  // get token() {
  //   return this._user.asObservable().pipe(map(user => {
  //       if (user) {
  //         return user.token;
  //       } else {
  //         return null;
  //       }
  //     })
  //   );
  // }


  constructor(
      private http: HttpClient, 
      private fireAuth: AngularFireAuth
    ) {}

  // autoLogin() {
  //   return from(Plugins.Storage.get({
  //     key: 'authData',
  //   })).pipe(
  //     map(storedData => {
  //       if(!storedData || !storedData.value) {
  //         return null;
  //       }
  //       const parsedData = JSON.parse(storedData.value) as {
  //         token: string;
  //         tokenExpirationDate: string;
  //         userId: string;
  //         email: string;
  //       };
  //       const expitrationTime = new Date(parsedData.tokenExpirationDate);
  //       if (expitrationTime <= new Date()) {
  //         return null;
  //       }
  //       const user = new User(
  //         parsedData.userId,
  //         parsedData.email,
  //         '',
  //         '',
  //         true,
  //         parsedData.token,
  //         expitrationTime
  //       );
  //       return user;
  //     }),
  //     tap(user => {
  //       this._user.next(user);
  //       this.autoLogout(user.tokenDuration);
  //     }),
  //     map(user => {
  //       return !!user;
  //     })
  //   );
  // }

  signUp(email: string, password: string) {
    return this.fireAuth.auth.createUserWithEmailAndPassword(email, password)
      .then(result => {
        this.sendVerificationMail();
        this.setUserData(result.user);
      });
        
        
      
      // .catch(err => {
      //   console.log('Something went wrong:',err.message);
      // });
    // return this.http.post<AuthResponseData>(
    //   `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${
    //   environment.config.apiKey
    //   }`,
    //   { email: email, password: password, returnSecureToken: true }
    // )
    // .pipe(tap(this.setUserData.bind(this)));

  }

  sendVerificationMail() {
    return this.fireAuth.auth.currentUser.sendEmailVerification()
    .then(() => {
      // this.router.navigate(['verify-email-address']);
    })
  }

  login(email: string, password: string) {
    return this.fireAuth.auth.signInWithEmailAndPassword(email, password)
      .then(result => {
        this.setUserData(result.user);
      });
      // .catch((error) => {
      //   window.alert(error.message)
      // })
    // return this.http.post<AuthResponseData>(
    //   `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${
    //   environment.config.apiKey
    //   }`,
    //   { email: email, password: password, returnSecureToken: true }
    // )
    // .pipe(tap(this.setUserData.bind(this)));
  }

  googleAuth() {
    console.log('googleAuth()');
    return this.authLogin(new auth.GoogleAuthProvider());
  }

  authLogin(provider) {
    return this.fireAuth.auth.signInWithPopup(provider).then(result => {
      var res = result;
      console.log(result.user);
      console.log(result.credential);
      // var userData = new AuthResponseData()
      this.setUserData(result.user);
      }
    );
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    Plugins.Storage.remove({key: 'authData'});
  }

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }


  // private setUserData(userData: AuthResponseData) {
  //   const expitrationTime = new Date(
  //     new Date().getTime() + (+userData.expiresIn * 1000)
  //   );
  //   const user = new User(
  //     userData.localId,
  //     userData.email,
  //     userData.idToken,
  //     expitrationTime
  //   );
  //   this._user.next(user);
  //   this.autoLogout(user.tokenDuration);
  //   this.storeAuthData(
  //     userData.localId,
  //     userData.idToken,
  //     expitrationTime.toISOString(),
  //     userData.email
  //   );
  // }

  private setUserData(userData) {
    // const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    var token = null;
    var expitrationTime = new Date();
    userData.getIdTokenResult().then(result =>{
      if (result) {
        token = result.token;
        expitrationTime = result.expirationTime;
      }
    });
    const user = new User(
      userData.uid,
      userData.email,
      userData.displayName,
      userData.photoURL,
      userData.emailVerified,
      token,
      expitrationTime
    );
    this._user.next(user);
    this.autoLogout(user.tokenDuration);
    this.storeAuthData(
      userData.uid,
      token,
      expitrationTime.toISOString(),
      userData.email
    );
  }

  private storeAuthData(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string
  ) {
    const data = JSON.stringify({ userId: userId, token: token, tokenExpirationDate: tokenExpirationDate, email: email});
    Plugins.Storage.set({
       key: 'authData',
       value: data
      }
    );
  }
}
