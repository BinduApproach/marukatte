import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss']
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private ngZone: NgZone
  ) {}

  ngOnInit() {}

  authenticate(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Logging in...' })
      .then(loadingEl => {
        loadingEl.present();
        // var authObs: Observable<AuthUserData>;
        var authObs: any;
        if (this.isLogin) {
          authObs=this.authService.signIn(email, password);
          
        } else {
          // authObs=this.authService.signUp(email, password);
          authObs=this.authService.signUp(email, password);
        }
        console.log('authObs', authObs);
        authObs
          .then(result => {
            this.isLoading = false;
            loadingEl.dismiss();
            this.router.navigateByUrl('/places');
          })
          .catch(error => {
            loadingEl.dismiss();
            console.log('ERROR code', error.code);
            console.log('ERROR message', error.message);
            this.showAlert(error.message);
          });
        // authObs.subscribe(
        //   resData => {
        //     console.log(resData);
        //     this.isLoading = false;
        //     loadingEl.dismiss();
        //     this.router.navigateByUrl('/places');
        //   },
        //   errRes => {
        //     console.log(errRes);
        //     loadingEl.dismiss();
        //     const code = errRes.error.error.message;
        //     let message = 'Could not sign you up, please try again.';
        //     if (code === 'EMAIL_EXISTS') {
        //       message = 'This email address exists already!';
        //     } else if ( code === 'EMAIL_NOT_FOUND' || code === 'INVALID_PASSWORD') {
        //       message = 'The E_Mail or password is not correct.';
        //     } else if (code === 'USER_DISABLED') {
        //       message = 'The user account has been disabled by an administrator.';
        //     }
        //     this.showAlert(message);
        //   }
        // );
      });
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    console.log('onSubmit before authenticate');
    this.authenticate(email, password);
    console.log('onSubmit after authenticate');
    form.reset();
  }

  socialSignIn(providerName: string) {
    var authObs: any;
    authObs = this.authService.socialAuth(providerName);
    authObs.then(() => {
            console.log('socialSignIn: ');
            this.isLoading = false;
            // loadingEl.dismiss();
            this.ngZone.run(() => {
              console.log('/places');
              this.router.navigate(['/places']);
            });
          })
          .catch(error => {
            // loadingEl.dismiss();
            console.log('ERROR code', error.code);
            console.log('ERROR message', error.message);
            this.showAlert(error.message);
          });

  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        message: message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }
}
