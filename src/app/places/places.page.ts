import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../auth/auth.service';

@Component({
  selector: 'app-places',
  templateUrl: './places.page.html',
  styleUrls: ['./places.page.scss'],
})
export class PlacesPage implements OnInit {

  constructor(public authService: AuthService) { }

  ngOnInit() {

  }

}
