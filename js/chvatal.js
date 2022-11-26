/* eslint-disable no-undef, no-unused-vars */

let illustration1Sketch = function (p) {

  var points = [];
  var edges = [];
  var triangulationEdges = [];
  var isPolygonCreated = false;
  var occurenceOfEachColor = [0, 0, 0, 0];

  p.setup = function () {
    const canvasContainer = document.getElementById("illustration1-canvas");
    let canvas = p.createCanvas(canvasContainer.offsetWidth, 450);
    canvas.mousePressed(p.addPoint);

    p.fill("black");
    p.textSize(40);
    button = p.createButton("Clear");
    button.position(10, 10);
    button.style("z-index", "3");
    button.parent("illustration1-canvas");
    button.mouseReleased(p.resetPoints);

    button2 = p.createButton("Create polygon");
    button2.position(70, 10);
    button2.style("z-index", "3");
    button2.parent("illustration1-canvas");
    button2.mouseReleased(p.createPolygon);

    button3 = p.createButton("Apply Chvátal's watchman theorem");
    button3.position(195, 10);
    button3.style("z-index", "3");
    button3.parent("illustration1-canvas");
    button3.mouseReleased(p.applyTriangulation);
  };

  p.draw = function () {
    // Put drawings here
    p.background(200);

    //This part draws the points and lines of the polygon
    let c;
    for (let i = 0; i < points.length; i++) {
      switch (points[i].color) {
        case 1:
          c = p.color("red");
          break;
        case 2:
          c = p.color("green");
          break;
        case 3:
          c = p.color("blue");
          break;
        default:
          c = p.color("black");
          break;
      }
      p.fill(c);
      p.noStroke();
      p.textSize(14);
      p.text(points[i].number, points[i].x + 5, points[i].y + 5);
      p.ellipse(points[i].x, points[i].y, 7, 7);
    }
    p.stroke("black");
    p.fill("black");
    for (let i = 0; i < edges.length; i++) {
      p.line(edges[i].pt1.x, edges[i].pt1.y, edges[i].pt2.x, edges[i].pt2.y);
    }

    // This part draws the lines create for the triangulation.
    p.stroke("grey");
    for (let i = 0; i < triangulationEdges.length; i++) {
      p.line(
        triangulationEdges[i].pt1.x,
        triangulationEdges[i].pt1.y,
        triangulationEdges[i].pt2.x,
        triangulationEdges[i].pt2.y
      );
    }
    p.stroke("black");
  };

  /* This method applies the triangulation on the drawn polygon */
  p.applyTriangulation = function () {
    if (isPolygonCreated) {
      p.recursiveTriangulation(points, triangulationEdges);
    } else {
      document.getElementById("illustration1-result").innerHTML =
        "The polygon is not created yet";
    }
  }

  /* This function clear the list of points, the polygon and the result computed */
  p.resetPoints = function () {
    points = [];
    edges = [];
    triangulationEdges = [];
    isPolygonCreated = false;
    document.getElementById("illustration1-result").innerHTML = "";
  };

  p.createPolygon = function () {
    isPolygonCreated = true;
    //add the last edge connecting edge 0 with the last one to close the polygon.

    points[0].adjList.push(points[points.length - 1]);
    points[points.length - 1].adjList.push(points[0]);
    edges.push(new Edge(points[0], points[points.length - 1], 0));
  };

  /* This function add a point to the list of points and call the function of the exercice if needed */
  p.addPoint = function () {
    if (!isPolygonCreated) {
      if (points.length === 0) {
        points.push(new Point(p.mouseX, p.mouseY, 0, 0, []));
      } else {
        points.push(
          new Point(p.mouseX, p.mouseY, points[points.length - 1].number + 1, 0, [])
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
  };

  /*This function check if a point is inside using the 3 determinant given in parameter */
  p.isInside = function (det1, det2, det3) {
    return (
      (det1 >= 0 && det2 >= 0 && det3 >= 0) ||
      (det1 <= 0 && det2 <= 0 && det3 <= 0)
    );
  };

  /*This function compute the determinant of the 3 points given in parameter */
  p.computeDeterminant = function (pt1, pt2, pt3) {
    let a = pt2.x - pt1.x;
    let b = pt3.x - pt1.x;
    let c = pt2.y - pt1.y;
    let d = pt3.y - pt1.y;
    let det = a * d - b * c;
    return det;
  };

  /* This function checks if the point i (of the global variable points) 
is convex (if it is left turn since we check in counter clock wise) */
  p.isConvex = function (i, ptsList) {
    let det = 0;
    if (i === 0) {
      det = p.computeDeterminant(
        ptsList[ptsList.length - 1],
        ptsList[i],
        ptsList[i + 1]
      );
    } else if (i === ptsList.length - 1) {
      det = p.computeDeterminant(ptsList[i - 1], ptsList[i], ptsList[0]);
    } else {
      det = p.computeDeterminant(ptsList[i - 1], ptsList[i], ptsList[i + 1]);
    }
    return det < 0;
  };

  /* This function checks if there is no concave points inside the triangle formed by the points i and his 2 neighbours */
  p.noConcaveInside = function (i, ptsList) {
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
        let det1 = p.computeDeterminant(pt1, pt2, ptsList[j]);
        let det2 = p.computeDeterminant(pt2, pt3, ptsList[j]);
        let det3 = p.computeDeterminant(pt3, pt1, ptsList[j]);
        result = p.isInside(det1, det2, det3);
        if (result) {
          break;
        }
      }
    }
    return !result;
  };

  /* This function returns an ear of the polygon. */
  p.findEar = function (ptsList) {
    let ear;
    let i = 0;
    let earNotFound = true;
    while (earNotFound) {
      if (p.isConvex(i, ptsList)) {
        if (p.noConcaveInside(i, ptsList)) {
          earNotFound = false;
          let neighbour1 = i === 0 ? ptsList.length - 1 : i - 1;
          let neighbour2 = i === ptsList.length - 1 ? 0 : i + 1;
          ear = new EarThree(ptsList[neighbour1], ptsList[i], ptsList[neighbour2]);
          //colorEar(ear);
        }
      }
      if (earNotFound) {
        i++;
      }
    }
    return [ear, i];
  };

  /**
   * This method tricolors the graph in O(n) time.
   */
  p.triColorGraph = function () {
    points[0].color = 1;
    points[1].color = 2;
    for (let i = 1; i < points.length - 1; i++) {
      if (points[i].adjList.length % 2 !== 0) {
        points[i + 1].color = points[i - 1].color;
      } else {
        points[i + 1].color = 6 - points[i - 1].color - points[i].color;
      }
      occurenceOfEachColor[points[i + 1].color]++;
    }
  };

  /**
   * This method returns the number of the color of the guards and display in the html the result.
   * @returns the number of the color of the guards.
   */
  p.findGuardsPosition = function () {
    let min = Infinity;
    let colorGuard = 0;
    for (let i = 1; i < occurenceOfEachColor.length; i++) {
      if (occurenceOfEachColor[i] < min) {
        min = occurenceOfEachColor[i];
        colorGuard = i;
      }
    }

    document.getElementById("illustration1-result").innerHTML =
      "The color of the guards is " + colors[colorGuard] + ".";
    return colorGuard;
  };

  /* This method apply the triangulation on the polygon reccursively.
  The method searches after an ear of the polygon and when it finds one,
   it "removes" it and the algo is restarted on the "new" polygon. 
   It ends when the polygon has only 3 vertices left 
   (and therefore this one is itself a triangle). */
  p.recursiveTriangulation = function (ptsList, egsList) {
    if (ptsList.length > 3) {
      let result = p.findEar(ptsList);
      let ear = result[0];
      let newptsList = [...ptsList];
      newptsList.splice(result[1], 1);
      points[ear.nghbr1.number].adjList.push(points[ear.nghbr2.number]);
      points[ear.nghbr2.number].adjList.push(points[ear.nghbr1.number]);
      egsList.push(new Edge(ear.nghbr1, ear.nghbr2, 1));
      p.recursiveTriangulation(newptsList, egsList);
    } else {
      p.triColorGraph();
      p.findGuardsPosition();
    }
  };

  p.windowResized = function () {
    p.customResize();
  };

  p.customResize = function () {
    const canvasContainer = document.getElementById("illustration1-canvas");
    p.resizeCanvas(canvasContainer.offsetWidth, 450);
  };
};