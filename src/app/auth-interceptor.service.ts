import { HttpEventType, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { tap } from "rxjs/operators";

export class AuthInterceptorService implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        //we can restrict any url by comparing req.url ....
        console.log("Request is on its way");

        //clone {url:new-url,params}....
        const modifiedRequest = req.clone({ headers: req.headers.append('Auth', 'abc') });


        /*let the req to continue and leaves the app and forward new req 
         iteract with response too */
        return next.handle(modifiedRequest);

    }
}