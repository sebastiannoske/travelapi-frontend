import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EventPaginationPipe } from './event/event-pagination.pipe';
import { BsDropdownModule } from 'ngx-bootstrap';
import { EventAssignDirective } from './event/event-assign.directive';
import { MdNativeDateModule, MdDatepickerModule, MdInputModule } from '@angular/material';
import { MomentModule } from 'angular2-moment';
// maps stuff
import { AgmCoreModule } from '@agm/core';
import { Ng4GeoautocompleteModule } from 'ng4-geoautocomplete';
import { GoogleAutoCompleteDirective } from './event/travel-new/google-auto-complete.directive';


@NgModule({
    declarations: [
        AppComponent,
        PageNotFoundComponent,
        MainComponent,
        TravelListComponent,
        TravelNewComponent,
        EventFilterPipe,
        EventPaginationPipe,
        EventAssignDirective,
        GoogleAutoCompleteDirective
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MdNativeDateModule,
        MdDatepickerModule,
        MdInputModule,
        MomentModule,
        Ng4GeoautocompleteModule.forRoot(),
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDS1rNqI3ZCpJu0fd8Rkyo5SAi8EPIna5g',
            libraries: ['places']
        }),
        BsDropdownModule.forRoot()
    ],
    providers: [EventDataService, EventRepository, EventPagination],
    bootstrap: [AppComponent]
})
export class AppModule {}
