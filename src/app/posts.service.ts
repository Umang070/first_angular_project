import { HttpClient, HttpEventType, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { map, catchError, tap } from "rxjs/operators";
import { Subject, throwError } from "rxjs";

//we don't need to add in appmodule
@Injectable({
    providedIn: 'root'
})
export class PostsService {

    error = new Subject<string>();
    constructor(private http: HttpClient) { }
    //for sending http request
    createAndSavePosts(userData: { username: string, email: string }) {
        const postData: Post = { userData: userData };
        this.http
            .post<{ name: string }>(
                'https://angular-guide-fa23a-default-rtdb.firebaseio.com/posts.json',
                postData,
                {
                    observe: 'response' //events, body// whole response
                }
            )//here,we don't want resposnse data so subscribe here is no any problem
            .subscribe(responseData => {
                console.log(responseData);
            }, errorResponse => {
                this.error.next(errorResponse.message);
            });
    }
    //for fetching http request and return observabel and send to component b'caz we r care about response data and strore in property
    getPosts() {
        let searchparams = new HttpParams(); //immutable 
        searchparams = searchparams.append('print', 'pretty');
        searchparams = searchparams.append('custom', 'hello'); //add new one 
        return this.http
            .get<{ [key: string]: Post }>('https://angular-guide-fa23a-default-rtdb.firebaseio.com/posts.json',
                {
                    headers: new HttpHeaders({ 'user-header': 'welcome' }),
                    // params: new HttpParams().set('print', 'angular')
                    params: searchparams
                }
            )
            .pipe(
                map((responseData) => {
                    const postsArray: Post[] = [];
                    for (const key in responseData) {
                        if (responseData.hasOwnProperty(key)) {
                            postsArray.push({ ...responseData[key], id: key });
                        }
                    }
                    return postsArray;
                }),
                catchError(errorResponse => {
                    //send to analytic server
                    return throwError(errorResponse);
                })
            )
    }

    deletePosts() {
        return this.http
            .delete('https://angular-guide-fa23a-default-rtdb.firebaseio.com/posts.json',
                {
                    observe: 'events',
                    responseType: 'text'
                })
            .pipe(
                tap(event => {
                    console.log(event)
                    if (event.type === HttpEventType.Sent) {
                        //we can pass any msg
                    }
                    if (event.type === HttpEventType.Response) {
                        console.log(event.body)
                    }
                })
            )
    }

}
