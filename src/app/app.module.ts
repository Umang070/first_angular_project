import { NgModule } from '@angular/core';

//angular modules for it's functionality
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

//import the component classes
import { AppComponent } from './app.component';
import { ServerComponent } from './server/server.component';
import { ServersComponent } from './servers/servers.component';
import { ShortenPipe } from './shorten.pipe';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { AuthInterceptorService } from './auth-interceptor.service';
import { LoggingInterceptorsService } from './logging-interceptor.service';
import { DrawPolygonComponent } from './drawPolygon/draw-polygon.component';
import { Router, RouterModule, Routes } from '@angular/router';



const appRoutes: Routes = [
  { path: 'polygon', component: DrawPolygonComponent }]



@NgModule({
  declarations: [
    AppComponent, ServerComponent, ServersComponent, ShortenPipe, DrawPolygonComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggingInterceptorsService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
