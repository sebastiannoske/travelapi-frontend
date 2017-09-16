import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { EventResolver } from './travels/event-resolver.service';

import { PageNotFoundComponent } from './page-not-found.component';
import { MainComponent } from './travels/main/main.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: ':id',
        component: MainComponent,
        resolve: { event: EventResolver },
        children: [
          {
            path: 'offers',
            component: PageNotFoundComponent,
            data: { type: 'offer' }
          },
          {
            path: 'requests',
            component: PageNotFoundComponent,
            data: { type: 'request' }
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
