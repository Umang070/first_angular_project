
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { fabric } from 'fabric';
import * as $ from 'jquery';
import { v4 as uuidv4 } from 'uuid';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import {
  FormArray,
  FormBuilder,
  FormControl,
  Validators
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
// lockMovementY: true , all Fabric objects have bounding box that's used to drag an object,
// or rotate and scale it, when controls / corners are present.
interface DrawingObject {
  type: string;
  background?: string;
  border?: string;
}
interface completeArray{
  guid: string;
  name: string;
  coordinates: any;
  strokeColor: any;
  
}
@Component({
  selector: 'app-draw-polygon',
  templateUrl: './draw-polygon.component.html',
  styleUrls: ['./draw-polygon.component.css']
})
export class DrawPolygonComponent implements OnInit {
  public sensorBtns = [
    {
      imgLink:
        'http://192.168.1.36:8002/nodeapi/live_rtsp?rtsp=rtsp://admin:Aivid2020@192.168.1.11:85/videoMainsc',     
		name: 'Sensor 1',
    },
    {
      imgLink:'https://images.unsplash.com/photo-1543200651-91fc6a469f99?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=725&q=80',       
      name: 'Sensor 2',
    },
    {
      imgLink:
        'http://192.168.1.2:5000/live_rtsp?rtsp=rtsp://admin:Aivid2020@192.168.1.31:85/videoMainsc',
      name: 'Sensor 3',
    },
    {
      imgLink:
        'http://192.168.1.2:5000/live_rtsp?rtsp=rtsp://admin:Aivid2020@192.168.1.32:85/videoMainsc',
      name: 'Sensor 4',
    },
    {
      imgLink:
        'http://192.168.1.2:5000/live_rtsp?rtsp=rtsp://admin:Aivid2020@192.168.1.33:85/videoMainsc',
      name: 'Sensor 5',
    },
  ];
  
  public obj;
  public selectedSensor;
  // public userInputs = [1179.84, 122.69, 618.24, 286.85, 1489.44, 433.73, 1167.84, 122.69, 1179.84, 122.69];
  // [453.97, 61, 371.51, 175, 501.1, 174, 454.88, 58, 453.97, 61][45.26, 28, 42.54, 130, 158.54, 127, 162.16, 34, 47.07, 30, 45.26, 28]
  @ViewChild('userInput', { static: true }) userInput: ElementRef;
  @ViewChild('userId', { static: true }) userId: ElementRef;
  public userInputStr = '';
  public userIdStr;
  public userInputs;
  public isClick = false;
  public roof = null;
  public roofPoints = [];
  public lines = [];
  public lineCounter = 0;
  public drawingObject: DrawingObject = {
    type: '',
    background: '',
    border: ''
  };
  public x = 0;
  public y = 0;
  public mycanvas;

  public scaleX;
  public scaleY;

  public xdiff;
  public ydiff;
  public objectArray: completeArray[] = [];
  public originalArray = [];
  public disableAddZoneButton = false;
  public isUpdateObject = false;
  public isZoneAdd = false;
  public totalZones = 3;
  public zoneName: string = 'Zone';
  public colorArray = ['red', 'blue', 'black'];
  public zoneClickCount = 0;
  Point(x, y) {
    this.x = x;
    this.y = y;
  }
  constructor() {}
  
  
  
  ngOnInit() {
    this.mycanvas = new fabric.Canvas('canvasTools');
    //   this.mycanvas.selection = false; didn't work    
    
    $('#poly').click(() => {
      if (this.drawingObject.type == 'roof') {
        this.drawingObject.type = '';
        this.lines.forEach(function (value) {
          this.mycanvas.remove(value);
        });
        this.roof = this.makeRoof(this.roofPoints);
        this.mycanvas.add(this.roof);
        this.mycanvas.renderAll();
      } else {
        this.drawingObject.type = 'roof'; // roof type
      }
    });

    this.mycanvas.renderAll();

    this.mycanvas.on('mouse:down', this.handleMouseDown);
    this.mycanvas.on('mouse:move', this.handleMouseMove);
        
    this.mycanvas.on('object:moved', this.handleMoveObject);
    this.mycanvas.on('object:scaled', this.handleScaledObject);
    this.mycanvas.on('object:rotated', this.handlerotatedObject);
    this.mycanvas.on('object:skewed', this.handleskewedObject);
   

    fabric.util.addListener(<HTMLElement>(<unknown>window), 'dblclick', () => {
      this.drawingObject.type = '';
      this.lines.forEach((value) => {
        this.mycanvas.remove(value);
      });


      if (this.roofPoints.length > 0) {
        const roof = this.makeRoof(this.roofPoints);
        //print points
        console.log('Original', this.roofPoints);
      
        const cleanedPoints = this.roofPoints.map(this.getScaledPoint);
        const finalArray = [];
        cleanedPoints
          .filter((_, index) => index != cleanedPoints.length - 2)
          .forEach((item) =>
            finalArray.push(
              ...[+Number(item.x).toFixed(2), +Number(item.y).toFixed(2)]
            )
          );
		  console.log("Cleaned",cleanedPoints);
        console.log('Array Points', finalArray);
        var uId = uuidv4();
        this.objectArray.push({ guid:uId,name:this.zoneName,coordinates:finalArray ,strokeColor:'red'})
        // roof.hasBorders = false;
        // roof.hasControls = false;
        // roof.selectable = false;

        this.mycanvas.add(roof);
        this.mycanvas.renderAll();
        console.log("Done !!",this.objectArray);
        
      };
      //user double click so reset all array
      this.roofPoints = [];
      this.lines = [];
      this.lineCounter = 0;
    });
  }
  drawRoiInput() {
    this.userInputStr = this.userInput.nativeElement.value;
    console.log("Input Str", this.userInputStr);

    //this.xdiff = -85;
    //this.ydiff = -45;
    if (this.userInputStr[this.userInputStr.length - 1] === ']' && this.userInputStr[0] === '[') {
      this.userInputStr = this.userInputStr.replace("[", "");
      this.userInputStr = this.userInputStr.replace("]", "");
    }
    this.userInputs = this.userInputStr.split(',').map((point) => +point);

    console.log('UserInputs', this.userInputs);

    const convertedPoints = [];
    for (let i = 0; i < this.userInputs.length; i += 2) {
      convertedPoints.push({
        x: this.userInputs[i],
        y: this.userInputs[i + 1]
      });
    }
    console.log('Converted Points', convertedPoints);
    const roiPoints = convertedPoints.map(this.getScaledDown);
    console.log("ROI Points in original form", roiPoints);
    const roof = this.roiRoof(roiPoints);
    // roof.hasBorders = false;
    // roof.hasControls = false;
    // roof.selectable = false;
    this.mycanvas.add(roof);

    this.mycanvas.renderAll();
  }

  sensorClick(sensor) {
    this.mycanvas.clear();
    this.isClick = true;
    this.selectedSensor = sensor;

    fabric.Image.fromURL(
      this.selectedSensor.imgLink,
      (oImg) => {
        const imgWidth = oImg.width;
        const imgHeight = oImg.height;

        this.mycanvas.setWidth(850);
        this.mycanvas.setHeight(500);

        const canvasWidth = this.mycanvas.getWidth();
        const canvasHeight = this.mycanvas.getHeight();
        this.scaleX = imgWidth / canvasWidth;
        this.scaleY = imgHeight / canvasHeight;

        const imgRatio = imgWidth / imgHeight;
        const canvasRatio = canvasWidth / canvasHeight;

        console.log('IMG RATIO', imgRatio);
        console.log('CANVAS RATIO', canvasRatio);

        if (imgRatio <= canvasRatio) {
          if (imgHeight < canvasHeight) {
            oImg.scaleToHeight(canvasHeight);
          }
          if (imgWidth < canvasWidth) {
            oImg.scaleToWidth(canvasWidth);
          }
        } else {
          if (imgWidth > canvasWidth) {
            oImg.scaleToWidth(canvasWidth);
          }
          if (imgHeight > canvasHeight) {
            oImg.scaleToHeight(canvasHeight);
          }
        }
        this.mycanvas.add(oImg);
      },
      { selectable: false }
    );

    fabric.util.requestAnimFrame(this.render);
  }
  render = () => {
    this.mycanvas.renderAll();
    fabric.util.requestAnimFrame(this.render);
  };

  deleteObject() {    
    console.log(this.mycanvas.getObjects());
    console.log(this.mycanvas.getActiveObject());
    var firstPoints = this.mycanvas.getActiveObject().points[0]
    var newPoints = [firstPoints].map(this.getScaledPoint)    
    var xPoint = +Number(newPoints[0].x.toFixed(2))
    var yPoint = +Number(newPoints[0].y.toFixed(2))
    this.objectArray.find((item) => item.coordinates[0] === xPoint && item.coordinates[1] === yPoint).name = '';
    this.mycanvas.remove(this.mycanvas.getActiveObject());
    console.log(this.objectArray);

    
  }
  zoneAdd() {
    // console.log("Zone Name",zoneName);
    this.isZoneAdd = true;
    this.zoneClickCount = this.zoneClickCount + 1;
    if (this.zoneClickCount === 3) {
      this.disableAddZoneButton = true;
    }
     
    let row = document.createElement('div');  
      row.className = 'from-control';
      row.innerHTML = `
      <br>
      <input type="text">`;
      document.querySelector('.showInputField').appendChild(row);
  
  }
  handleScaledObject = (options) => {
    this.isUpdateObject = true;
    var scaledObject = options.target;
    console.log("Scaled Object",scaledObject)    
  }
  handleMoveObject = (options) => {
    this.isUpdateObject = true;
    var mynewCanvas = this.mycanvas.viewportTransform;
    console.log("NEW CAnvas", mynewCanvas);
    
    
    var mObject = this.mycanvas.getActiveObject().calcTransformMatrix();
    var mTotal = fabric.util.multiplyTransformMatrices(mynewCanvas, mObject); // inverting the order gives wrong result
    var mInverse = fabric.util.invertTransform(mTotal);

    console.log(mObject,mTotal,mInverse);
    
    
    var actObj = options.target;
    var coords = actObj.calcCoords();
    console.log("NEW", actObj);
    var left = coords.tl.x;
    var top = coords.tl.y;
    console.log(left, top);
    // return { left: left, top: top };    
  }
  handlerotatedObject = (options) => {
    console.log("Rotated Object", options.target);
  }
  handleskewedObject = (options) => {
    console.log("Skewed Object", options.target);
    
  }
  // options.target === undefined // click outside the canvas this.mycanvas.off('mouse:down');
  handleMouseDown = (options: any) => {
    if (this.drawingObject.type == 'roof') {
      this.mycanvas.selection = false;

      this.setStartingPoint(options); // set x,y

      this.roofPoints.push({ x: this.x, y: this.y });
      const points = [this.x, this.y, this.x, this.y];
      this.lines.push(
        new fabric.Line(points, {
          strokeWidth: 3,
          selectable: false,
          stroke: 'red'
        })
      );
      this.mycanvas.add(this.lines[this.lineCounter]);
      this.lineCounter++;
      this.mycanvas.on('mouse:up', (_options) => {
        this.mycanvas.selection = true;
      });
    }
  };

  handleMouseMove = (options) => {
    if (
      this.lines[0] !== null &&
      this.lines[0] !== undefined &&
      this.drawingObject.type == 'roof'
    ) {
      this.setStartingPoint(options);
      this.lines[this.lineCounter - 1].set({
        x2: this.x,
        y2: this.y
      });
      this.mycanvas.renderAll();
    }
  };

  setStartingPoint = (options) => {
    const offset = $('#canvasTools').offset();
    this.x = options.e.pageX - offset.left;
    this.y = options.e.pageY - offset.top;
  };

  makeRoof = (roofPoints) => {
    const left = this.findLeftPaddingForRoof(roofPoints);
    const top = this.findTopPaddingForRoof(roofPoints);
    console.log("left roof point", left);
    console.log("top roof point", top);
    
    roofPoints.push({ x: roofPoints[0].x, y: roofPoints[0].y });
    const roof = new fabric.Polyline(roofPoints, {
      fill: 'rgba(0,0,0,0)',
      stroke: 'red'
    });
    roof.set({
      left: left,
      top: top
    });

    return roof;
  };
  roiRoof = (roiPoints) => {
    const left = this.findLeftPaddingForRoiRoof(roiPoints);
    const top = this.findTopPaddingForRoiRoof(roiPoints);

    console.log("left roof point roi", left);
    console.log("top roof point roi", top);
    
    const roof = new fabric.Polyline(roiPoints, {
      fill: 'rgba(0,0,0,0)',
      stroke: '#1619f2'
    });
    roof.set({
      left: left,
      top: top
    });

    return roof;
  };

  getScaledPoint = ({ x, y }) => {
    console.log('X', this.scaleX, 'Y', this.scaleY);
    return { x: this.scaleX * x, y: this.scaleY * y };
  };
  getScaledDown = ({ x, y }) => {
    console.log('X', this.scaleX, 'Y', this.scaleY);
    return { x: (x / this.scaleX), y: (y / this.scaleY)};
  };

  findTopPaddingForRoof(roofPoints) {
    let result = 999999;
    for (let f = 0; f < this.lineCounter; f++) {
      if (roofPoints[f].y < result) {
        result = roofPoints[f].y;
      }
    }
    return Math.abs(result);
  }
  findLeftPaddingForRoof(roofPoints) {
    let result = 999999;
    for (let i = 0; i < this.lineCounter; i++) {
      if (roofPoints[i].x < result) {
        result = roofPoints[i].x;
      }
    }
    return Math.abs(result);
  }

  findLeftPaddingForRoiRoof(roiPoints) {
    let result = 999999;
    for (let i = 0; i < roiPoints.length - 1; i++) {
      if (roiPoints[i].x < result) {
        result = roiPoints[i].x;
      }
    }
    return Math.abs(result);
  }
  findTopPaddingForRoiRoof(roiPoints) {
    let result = 999999;
    for (let f = 0; f < roiPoints.length - 1; f++) {
      if (roiPoints[f].y < result) {
        result = roiPoints[f].y;
      }
    }
    return Math.abs(result);
  }
}
// if (canvas.getActiveGroup()) {
//     canvas.getActiveGroup().forEachObject(function(obj) {
//         // Do something with the selected objects...
//     });
// } else {
//     var object = canvas.getActiveObject();
//     // Do something with the selected object...
// }


