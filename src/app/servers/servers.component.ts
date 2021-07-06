import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-servers',           //as a element
  // selector:'[app-servers]',       //change to attribute
  // selector: '.app-servers',         //to class
  templateUrl: './servers.component.html',
  // or if u want to inline template
  // template:`
  //         <app-server></app-server>
  //         <app-sever></app-server>`,
  styleUrls: ['./servers.component.css']
  // styles: [`
  //           h2{
  //             color:green
  //           }`]
})
export class ServersComponent implements OnInit {
  allowNewServer = false;
  serverIsCreate = "Server is not created yet!!";
  serverName = 'Default';       ///we can set default value
  serverCreated = false;
  servers = ['Server1']
  // constructor() {
  //   setTimeout(() => {
  //     this.allowNewServer = true;
  //   },2000);
  // }

  ngOnInit(): void {
  }

  onAddServer() {
    this.serverCreated = true;
    this.servers.push(this.serverName);
    // this.serverIsCreate = "Now,Server was created!! and Name of the Server is :" + this.serverName;
  }
  onChangeServerName(event: Event) {
    this.serverName = (<HTMLInputElement>event.target).value;         //console.log(event)
  }

}

