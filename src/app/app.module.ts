import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { MainComponent } from './travels/main/main.component';
import { EventDataService } from './travels/event-data.service';
import { EventPagination } from './travels/event-pagination.service';
import { EventRepository } from './travels/event-repository.service';
import { TravelListComponent } from './travels/travel-list/travel-list.component';
import { TravelNewComponent } from './travels/travel-new/travel-new.component';

@NgModule({
    declarations: [
        AppComponent,
        PageNotFoundComponent,
        MainComponent,
        TravelListComponent,
        TravelNewComponent
    ],
    imports: [BrowserModule, HttpClientModule, AppRoutingModule],
    providers: [EventDataService, EventRepository, EventPagination],
    bootstrap: [AppComponent]
})
export class AppModule {}
