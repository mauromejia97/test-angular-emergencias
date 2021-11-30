import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main/main.component';
import { SharedModule } from './shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './main/modal/modal.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule, 
    HttpClientModule, NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
