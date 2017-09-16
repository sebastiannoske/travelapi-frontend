import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { MainComponent } from './travels/main/main.component';
import { EventDataService } from './travels/event-data.service';

@NgModule({
  declarations: [AppComponent, PageNotFoundComponent, MainComponent],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule],
  providers: [EventDataService],
  bootstrap: [AppComponent]
})
export class AppModule {}
