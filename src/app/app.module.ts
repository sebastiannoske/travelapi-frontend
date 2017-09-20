import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { MainComponent } from './event/main/main.component';
import { EventDataService } from './event/event-data.service';
import { EventPagination } from './event/event-pagination.service';
import { EventRepository } from './event/event-repository.service';
import { TravelListComponent } from './event/travel-list/travel-list.component';
import { TravelNewComponent } from './event/travel-new/travel-new.component';
import { EventFilterPipe } from './event/event-filter.pipe';
import { EventPaginationPipe } from './event/event-pagination.pipe';

@NgModule({
    declarations: [
        AppComponent,
        PageNotFoundComponent,
        MainComponent,
        TravelListComponent,
        TravelNewComponent,
        EventFilterPipe,
        EventPaginationPipe
    ],
    imports: [BrowserModule, HttpClientModule, AppRoutingModule],
    providers: [EventDataService, EventRepository, EventPagination],
    bootstrap: [AppComponent]
})
export class AppModule {}
