import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { EventResolver } from './travels/event-resolver.service';

import { PageNotFoundComponent } from './page-not-found.component';
import { MainComponent } from './travels/main/main.component';
import { TravelListComponent } from './travels/travel-list/travel-list.component';
import { TravelNewComponent } from './travels/travel-new/travel-new.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: ':id',
                component: MainComponent,
                resolve: { eventHead: EventResolver },
                children: [
                    {
                        path: '',
                        redirectTo: 'offers',
                        pathMatch: 'full'
                    },
                    {
                        path: 'offers',
                        component: TravelListComponent,
                        data: { type: 'offer' }
                    },
                    {
                        path: 'requests',
                        component: TravelListComponent,
                        data: { type: 'request' }
                    },
                    {
                        path: 'new',
                        component: TravelNewComponent
                    }
                ]
            },
            { path: '**', component: PageNotFoundComponent }
        ])
    ],
    providers: [EventResolver],
    exports: [RouterModule]
})
export class AppRoutingModule {}
