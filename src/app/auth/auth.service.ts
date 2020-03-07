import { Injectable, NgZone } from '@angular/core';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';

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



export class AuthService {
  userData: any; // Save logged in user data

  constructor(
    public afs: AngularFirestore,   // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    private router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    })
  }

  // Sign in with email/password
  signIn(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.setUserData(result.user);
      });
  }

  // Sign up with email/password
  signUp(email, password) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((result) => {
        /* Call the SendVerificaitonMail() function when new user sign 
        up and returns promise */
        this.setUserData(result.user);
        this.sendVerificationMail();
      }).catch((error) => {
        window.alert(error.message);
      });
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    // return (user !== null && user.emailVerified !== false) ? true : false;
    return (user !== null ) ? true : false;
  }

  get getUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  // Sign in with Google
  socialAuth(providerName: string) {
    let provider = null;
    if (providerName === 'google') {
      provider = new auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
    } else if (providerName === 'facebook') {
      provider = new auth.FacebookAuthProvider();
      // provider.addScope('profile');
      // provider.addScope('email');
    }
    return this.AuthLogin(provider);
  }

  // Auth logic to run auth providers
  AuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
    .then((result) => {
      // this.ngZone.run(() => {
      //   this.router.navigateByUrl('/places');
      // });
      console.log('Provider:', result);
      this.setUserData(result.user);
    });
  }

    // Send email verfificaiton when new user sign up
    sendVerificationMail() {
      return this.afAuth.auth.currentUser.sendEmailVerification()
      .then(result => {
        console.log(result);
        this.router.navigateByUrl('verify-email-address');
      });
    }
  
    // Reset Forggot password
    ForgotPassword(passwordResetEmail) {
      return this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      }).catch((error) => {
        window.alert(error);
      });
    }

  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  setUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    // if (user.providerData) {
    //   if (user.providerData[0].email === user.email) {
    //     user.emailVerified = true;
    //   }
    // }
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    }
    return userRef.set(userData, {
      merge: true
    });
  }

  // Sign out 
  signOut() {
    return this.afAuth.auth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigateByUrl('/home');
    });
  }

}
