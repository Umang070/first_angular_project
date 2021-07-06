import { Component } from "@angular/core";


@Component({
    selector: "app-server",
    templateUrl: "./server.component.html",
    styleUrls: ["./server.component.css"]
})
export class ServerComponent {
    serverID = 10;
    serverStatus = "";

    constructor() {
        this.serverStatus = Math.random() > 0.5 ? "Online" : "Offline";
    }

    getColor() {
        return this.serverStatus === "Online" ? "green" : "red";
    }


    // getServerStatus() {
    //     return this.serverStatus;
    // }

}