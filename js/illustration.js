/* eslint-disable no-undef, no-unused-vars */

/* This class represents a point. */
class Point {
    constructor(x, y, nb, color, adjList) {
      this.x = x;
      this.y = y;
      this.number = nb;
      this.color = color; // 0 = black, 1 = red, 2 = green, 3 = blue
      this.adjList = adjList;
    }
  }
  
  /* This class represents an edge. */
  class Edge {
    constructor(pt1, pt2, color) {
      this.pt1 = pt1;
      this.pt2 = pt2;
      this.color = color;
    }
  }
  
  /* This class represents an ear. */
  class Ear {
    constructor(nghbr1, pt, nghbr2) {
      this.nghbr1 = nghbr1;
      this.pt = pt;
      this.nghbr2 = nghbr2;
    }
  }
  
  // global variables
  var points = [];
  var pointsForComputation = [];
  var edges = [];
  var triangulationEdges = [];
  var isPolygonCreated = false;
  var occurenceOfEachColor = [0,0,0,0]
  
  function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.mousePressed(addPoint);
    // Put setup code here
    fill("black");
    textSize(40);
    button = createButton("Clear");
    button.position(10, 200);
    button.mouseReleased(resetpoints);
  
    button2 = createButton("Create polygon");
    button2.position(68, 200);
    button2.mouseReleased(createPolygon);
  
    button3 = createButton("apply triangulation");
    button3.position(180, 200);
    button3.mouseReleased(applyTriangulation);
  }
  
  /* This method applies the triangulation on the drawn polygon */
  function applyTriangulation() {
    if (isPolygonCreated) {
      reccursiveTriangulation(points, triangulationEdges);
    } else {
      document.getElementById("result").innerHTML =
        "The polygon is not created yet";
    }
  }
  
  /* This function clear the list of points, the polygon and the result computed */
  function resetpoints() {
    points = [];
    edges = [];
    triangulationEdges = [];
    isPolygonCreated = false;
    document.getElementById("result").innerHTML = "";
  }
  
  function createPolygon() {
    isPolygonCreated = true;
    //add the last edge connecting edge 0 with the last one to close the polygon.
  
    points[0].adjList.push(points[points.length - 1]);
    points[points.length - 1].adjList.push(points[0]);
    edges.push(new Edge(points[0], points[points.length - 1], 0));
  }
  
  /* This function add a point to the list of points and call the function 
  of the exercice if needed */
  function addPoint() {
    if (!isPolygonCreated) {
      if (points.length === 0) {
        points.push(new Point(mouseX, mouseY, 0, 0, []));
      } else {
        points.push(
          new Point(mouseX, mouseY, points[points.length - 1].number + 1, 0, [])
        );
      }
      if (points.length > 1) {
        points[points.length - 2].adjList.push(points[points.length - 1]);
        points[points.length - 1].adjList.push(points[points.length - 2]);
        edges.push(
          new Edge(points[points.length - 2], points[points.length - 1], 0)
        );
      }
    }
  }
  
  /*This function check if a point is inside using the 3 determinant given 
  in parameter */
  function isInside(det1, det2, det3) {
    return (
      (det1 >= 0 && det2 >= 0 && det3 >= 0) ||
      (det1 <= 0 && det2 <= 0 && det3 <= 0)
    );
  }
  
  /*This function compute the determinant of the 3 points given in parameter */
  function computeDeterminant(pt1, pt2, pt3) {
    let a = pt2.x - pt1.x;
    let b = pt3.x - pt1.x;
    let c = pt2.y - pt1.y;
    let d = pt3.y - pt1.y;
    let det = a * d - b * c;
    return det;
  }
  
  /* This function sorts the points by Y-coordinates */
  function sortByYCoordinate() {
    points.sort(compare);
  }
  
  /* This is the comparaison function used to sort the points by Y-coordinate */
  function compare(a, b) {
    if (a.y - b.y === 0) {
      return a.x - b.x;
    } else {
      return a.y - b.y;
    }
  }
  
  /* This function checks if the point i (of the global variable points) 
  is convex (if it is left turn since we check in counter clock wise) */
  function isConvex(i, ptsList) {
    let det = 0;
    if (i === 0) {
      det = computeDeterminant(
        ptsList[ptsList.length - 1],
        ptsList[i],
        ptsList[i + 1]
      );
    } else if (i === ptsList.length - 1) {
      det = computeDeterminant(ptsList[i - 1], ptsList[i], ptsList[0]);
    } else {
      det = computeDeterminant(ptsList[i - 1], ptsList[i], ptsList[i + 1]);
    }
    return det < 0;
  }
  
  /* This function checks if there is no concave points 
  inside the triangle formed by the points i and his 2 neighbours */
  function noConcaveInside(i, ptsList) {
    let pt1 = i === 0 ? ptsList[ptsList.length - 1] : ptsList[i - 1];
    let pt2 = ptsList[i];
    let pt3 = i === ptsList.length - 1 ? ptsList[0] : ptsList[i + 1];
    let result = false;
    for (let j = 0; j < ptsList.length; j++) {
      if (
        ptsList[j].number !== pt1.number &&
        ptsList[j].number !== pt2.number &&
        ptsList[j].number !== pt3.number
      ) {
        // This part checks if ptsList[j] is inside the triangle pt1, pt2, pt3
        let det1 = computeDeterminant(pt1, pt2, ptsList[j]);
        let det2 = computeDeterminant(pt2, pt3, ptsList[j]);
        let det3 = computeDeterminant(pt3, pt1, ptsList[j]);
        result = isInside(det1, det2, det3);
        if (result) {
          break;
        }
      }
    }
    return !result;
  }
  
  /* This function returns an ear of the polygon. */
  function findEar(ptsList) {
    let ear;
    let i = 0;
    let earNotFound = true;
    while (earNotFound) {
      if (isConvex(i, ptsList)) {
        if (noConcaveInside(i, ptsList)) {
          earNotFound = false;
          let neighbour1 = i === 0 ? ptsList.length - 1 : i - 1;
          let neighbour2 = i === ptsList.length - 1 ? 0 : i + 1;
          ear = new Ear(ptsList[neighbour1], ptsList[i], ptsList[neighbour2]);
          //colorEar(ear);
        }
      }
      if (earNotFound) {
        i++;
      }
    }
    return [ear, i];
  }
  
  function triColorGraph() {
    points[0].color = 1;
    points[1].color = 2;
    for (let i = 1; i < points.length - 1; i++) {
      if (points[i].adjList.length % 2 !== 0) {
        points[i + 1].color = points[i - 1].color;
      } else {
        points[i + 1].color = 6 - points[i - 1].color - points[i].color;
      }
      occurenceOfEachColor[points[i+1].color]++;
    }
  }
  
  function findGuardsPosition(){
    let min = Infinity;
    let colorGuard = 0;
    for(let i = 1; i<occurenceOfEachColor.length; i++){
        if(occurenceOfEachColor[i]<min)
            colorGuard = i;
    }
    return colorGuard;
  }

  /*function colorEar(ear) {
    pointsToColor = [];
    var colorUsed = [0, 0, 0, 0];
    if (ear.nghbr1.color === 0) {
      pointsToColor.push(ear.nghbr1);
    } else {
      colorUsed[ear.nghbr1.color]++;
    }
    if (ear.nghbr2.color === 0) {
      pointsToColor.push(ear.nghbr2);
    } else {
      colorUsed[ear.nghbr2.color]++;
    }
    if (ear.pt.color === 0) {
      pointsToColor.push(ear.pt);
    } else {
      colorUsed[ear.pt.color]++;
    }
    pointsToColor.forEach((element) => {
      for (let i = 1; i < colorUsed.length; i++) {
        if (colorUsed[i] === 0) {
          element.color = i;
          colorUsed[i]++;
          break;
        }
      }
    });
  }*/
  
  /* This method apply the triangulation on the polygon reccursively.
  The method searches after an ear of the polygon and when it finds one,
   it "removes" it and the algo is restarted on the "new" polygon. 
   It ends when the polygon has only 3 vertices left 
   (and therefore this one is itself a triangle). */
  function reccursiveTriangulation(ptsList, egsList) {
    if (ptsList.length > 3) {
      let result = findEar(ptsList);
      let ear = result[0];
      let newptsList = [...ptsList];
      newptsList.splice(result[1], 1);
      points[ear.nghbr1.number].adjList.push(points[ear.nghbr2.number]);
      points[ear.nghbr2.number].adjList.push(points[ear.nghbr1.number]);
      egsList.push(new Edge(ear.nghbr1, ear.nghbr2, 1));
      reccursiveTriangulation(newptsList, egsList);
    } else {
      let ear = new Ear(ptsList[0], ptsList[1], ptsList[2]);
      //colorEar(ear);
      console.log(points);
      triColorGraph();
      console.log(findGuardsPosition());
    }
  }
  
  function draw() {
    // Put drawings here
    background(200);
  
    //This part draws the points and lines of the polygon
    for (let i = 0; i < points.length; i++) {
      stroke("black");
      fill("black");
      switch (points[i].color) {
        case 1:
          stroke("red");
          fill("red");
          break;
        case 2:
          stroke("green");
          fill("green");
          break;
        case 3:
          stroke("blue");
          fill("blue");
          break;
        default:
          stroke("black");
          fill("black");
          break;
      }
      textSize(14);
      text(points[i].number, points[i].x + 5, points[i].y + 5);
      ellipse(points[i].x, points[i].y, 7, 7);
    }
    stroke("black");
    fill("black");
    for (let i = 0; i < edges.length; i++) {
      line(edges[i].pt1.x, edges[i].pt1.y, edges[i].pt2.x, edges[i].pt2.y);
    }
  
    // This part draws the lines create for the triangulation.
    stroke("red");
    for (let i = 0; i < triangulationEdges.length; i++) {
      line(
        triangulationEdges[i].pt1.x,
        triangulationEdges[i].pt1.y,
        triangulationEdges[i].pt2.x,
        triangulationEdges[i].pt2.y
      );
    }
    stroke("black");
  }
  
  // This Redraws the Canvas when resized
  windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
  };
  