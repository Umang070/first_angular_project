import { AfterViewInit, Component, ElementRef, OnInit } from "@angular/core";
import { fabric } from "fabric";
import * as $ from 'jquery';
@Component({
    selector: 'app-draw-polygon',
    templateUrl: './draw-polygon.component.html',
    styleUrls: ['./draw-polygon.component.css'],
})
export class DrawPolygonComponent implements OnInit, AfterViewInit {

    public imgRef;
    public imgRefs = [{ imgLink: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUWRy6ZeIRHk3Xl-8bRvKaUtJCuee08y8Asg&usqp=CAU", name: 'Censor1' },
    { imgLink: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg", name: 'Censor2' }
    ];
    public obj;
    ngOnInit() { }
    ngAfterViewInit() {
        // const mycanvas = this.canvas; //sometimes function might confuse with class this and function this
        // handler: ($: JQueryStatic) => void): JQuery < Document >
        // 

    }

    // censorClick1(imgref: any) {
    //     this.imgRef = imgref;
    // }
    // }
    // censorClick2(imgref: any) {
    //     this.imgRef = imgref;
    // }
    censorClick(i) {
        console.log("INDEEEEE", i);

        const obj = this.imgRefs[i]
        const index = i;
        console.log(obj)




        // console.log("Index", index)
        $(document).ready(function () {

            // console.log("OBJJJJJJ", obj);



            var roof = null;
            var roofPoints = [];
            var lines = [];
            var lineCounter = 0;
            var drawingObject: { type: string, background?: string, border?: string } = { type: '', background: '', border: '' };


            // canvas Drawing


            var x = 0;
            var y = 0;




            // var immg = "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg"
            var immg = obj.imgLink;

            // var immg = "U:\AIVID_TechVision\Angular_Course\my-first-app\src\app\drawPolygon\bulboff.jpg";
            // const immg = "http://192.168.1.2:5000/live_rtsp?rtsp=rtsp://admin:Aivid2020@192.168.1.11:85/videoMainsc";

            let img = new Image();




            function Point(x, y) {
                this.x = x;
                this.y = y;
            }

            // const new1 = <HTMLElement>document.getElementById('poly' + i);


            $('#poly' + index).click(function (): void {
                console.log("Click not fired");

                if (drawingObject.type == "roof") {
                    drawingObject.type = "";
                    lines.forEach(function (value, index, ar) {
                        this.canvas.remove(value);
                    });
                    //canvas.remove(lines[lineCounter - 1]);
                    console.log(roofPoints);
                    roof = makeRoof(roofPoints);
                    mycanvas.add(roof); //error
                    mycanvas.renderAll();
                } else {
                    console.log("Mouse click Event Fired");

                    drawingObject.type = "roof"; // roof type
                }
            });
            // });

            const mycanvas = new fabric.Canvas("canvasTools");

            img.src = immg;
            img.onload = function () {
                var imgbase64 = new fabric.Image(img, {
                    width: 800, //400
                    height: 500, //500,
                    selectable: false,
                });
                mycanvas.add(imgbase64);
                // mycanvas.deactivateAll().renderAll(); //commented
                mycanvas.discardActiveObject().renderAll();
            };

            mycanvas.renderAll();
            // window The Correct way to add custom events to Fabric.js canvas.upperCanvasEl



            fabric.util.addListener(<HTMLElement><unknown>window, "dblclick", function () {
                console.log("DOUBLEEE CLICK STARTING")
                drawingObject.type = "";
                lines.forEach((value, index, ar) => {
                    mycanvas.remove(value);
                });
                // canvas.remove(lines[lineCounter - 1]);
                roof = makeRoof(roofPoints);
                //print points
                console.log("hello from Double click", roofPoints);
                mycanvas.add(roof);
                mycanvas.renderAll();
                var obj = mycanvas.getActiveObject();
                //user double click so reset all array
                console.log("double click");
                //clear arrays
                roofPoints = [];
                lines = [];
                lineCounter = 0;
            });
            // .setOriginX(x).setOriginY(y)

            mycanvas.on("mouse:down", function (options) {
                console.log("Starting_down")
                if (drawingObject.type == "roof") {
                    mycanvas.selection = false;
                    console.log("DOWN", options);
                    setStartingPoint(options); // set x,y

                    roofPoints.push(new Point(x, y));
                    var points = [x, y, x, y];
                    lines.push(
                        new fabric.Line(points, {
                            strokeWidth: 3,
                            selectable: false,
                            stroke: "red",
                        })
                        // .setOriginX(x)
                        // .setOriginY(y)
                    );
                    mycanvas.add(lines[lineCounter]);
                    lineCounter++;
                    mycanvas.on("mouse:up", function (options) {
                        console.log("UPPPPPP");

                        mycanvas.selection = true;
                    });
                }
                console.log("OutsideDown");

            });
            mycanvas.on("mouse:move", function (options) {
                if (
                    lines[0] !== null &&
                    lines[0] !== undefined &&
                    drawingObject.type == "roof"
                ) {
                    setStartingPoint(options);
                    lines[lineCounter - 1].set({
                        x2: x,
                        y2: y,
                    });
                    mycanvas.renderAll();
                }
            });

            function setStartingPoint(options) {
                var offset = $("#canvasTools").offset();
                x = options.e.pageX - offset.left;
                y = options.e.pageY - offset.top;

            }

            function makeRoof(roofPoints) {
                var left = findLeftPaddingForRoof(roofPoints);
                var top = findTopPaddingForRoof(roofPoints);
                console.log("------", roofPoints);
                roofPoints.push(new Point(roofPoints[0].x, roofPoints[0].y));
                var roof = new fabric.Polyline(roofPoints, {
                    fill: "rgba(0,0,0,0)",
                    stroke: "#58c",
                });
                roof.set({
                    left: left,
                    top: top,
                });

                return roof;
            }

            function findTopPaddingForRoof(roofPoints) {
                var result = 999999;
                for (var f = 0; f < lineCounter; f++) {
                    if (roofPoints[f].y < result) {
                        result = roofPoints[f].y;
                    }
                }
                return Math.abs(result);
            }

            function findLeftPaddingForRoof(roofPoints) {
                var result = 999999;
                for (var i = 0; i < lineCounter; i++) {
                    if (roofPoints[i].x < result) {
                        result = roofPoints[i].x;
                    }
                }
                return Math.abs(result);
            }

        });




    }





}

