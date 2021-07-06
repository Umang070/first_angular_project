import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Post } from './post.model';
import { PostsService } from './posts.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('f') userForm: NgForm;
  answer = '';
  userName = 'Umang';
  selectedOption = 'pet';
  emailId = 'xyz@gmail.com';
  genders = ['Male', 'Female', 'Other'];
  isSubmitted = false;
  //JS object
  user = {
    userName: '',
    emailId: '',
    secretQue: '',
    comments: '',
    gender: '',
  }

  suggestUserName() {
    // this.userForm.setValue({
    //   userData: {
    //     username: "umang",
    //     email: ''
    //   },
    //   secret: '',
    //   questionAnswer: "pet",
    //   gender: "Male"
    // })
    this.userForm.form.patchValue({
      userData: {
        username: 'Umang',
      }
    })

  }
  onSubmit() {
    // console.log(this.userForm);
    this.isSubmitted = true;
    this.user.userName = this.userForm.value.userData.username;
    this.user.emailId = this.userForm.value.userData.email;
    this.user.secretQue = this.userForm.value.secret;
    this.user.comments = this.userForm.value.comments;
    this.user.gender = this.userForm.value.gender;

    this.userForm.reset();    //we can pass an object with specific value
  }

  loadedPosts: Post[] = []; //empty array
  isFetching = false;
  error = null;
  errorMsg = null;
  private errSub: Subscription; //if want to get rid of this component
  constructor(private http: HttpClient, private postsService: PostsService) { }

  ngOnInit() {
    // this.fetchPosts();  this initialize method 
    //subscribe to error(subject) 
    this.errSub = this.postsService.error.subscribe(errMsg => {
      this.error = errMsg;
    })
  }


  onCreatePost(postData: Post) {
    // Send Http request
    this.postsService.createAndSavePosts(postData.userData);
  }

  onFetchPosts() {
    // Send Http request (get)
    this.isFetching = true;
    this.postsService.getPosts().subscribe(posts => {
      this.isFetching = false;
      this.loadedPosts = posts;
    }, errorResponse => {
      this.isFetching = false;
      this.error = errorResponse.message;
      this.errorMsg = errorResponse.error.error;
      // console.log(errorResponse);
    });
  }

  onClearPosts() {
    // Send Http request
    this.postsService.deletePosts().subscribe(() => {
      this.loadedPosts = [];
    })
  }
  onHandleError() {
    this.error = null;
  }
  ngOnDestroy() {
    this.errSub.unsubscribe();
  }
}
