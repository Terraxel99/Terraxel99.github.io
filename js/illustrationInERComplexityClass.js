/* eslint-disable no-undef, no-unused-vars */

let illustration5Sketch = function (p) {

  // global variables
  var points = [];
  var regionsPointsSet = [];
  var witnessPointsSet = [];
  var edges = [];
  var guards = [];
  var ears = [];
  var edgesRegions = [];
  var boolRegions = false;
  var boolTriangulation = false;
  var boolIntersection = false;
  var boolWitness = false;
  var triangulationEdges = [];
  var isPolygonCreated = false;
  var occurenceOfEachColor = [0, 0, 0, 0];

  p.setup = function () {

    const canvasContainer = document.getElementById("illustration5-canvas");
    let canvas = p.createCanvas(canvasContainer.offsetWidth, 450);

    // Put setup code here
    p.fill("black");
    p.textSize(40);

    // Create a basic polygon
    p.initFigure();

    /** Apply the triangulation to allow to check later if a point 
    is inside the polygon (and thus inside at least one triangle 
    of the polygon)*/
    p.applyTriangulation();

    /** Run the algorithm to check if a guard cover the polygon*/
    p.run();

    button1 = p.createButton("Display/remove regions");
    button1.position(10, 10);
    button1.mouseReleased(p.displayOrRemoveRegions);

    button2 = p.createButton("Display/remove intersections points");
    button2.position(185, 10);
    button2.mouseReleased(p.displayOrRemoveIntersection);

    button3 = p.createButton("Display/remove witness set");
    button3.position(440, 10);
    button3.mouseReleased(p.displayOrRemoveWitness);

    button2 = p.createButton("Display/remove triangulation");
    button2.position(640, 10);
    button2.mouseReleased(p.displayOrRemoveTriangulation);
  }

  /**
   * This method creates a basic figure which is used as example in the report
   */
  p.initFigure = function () {
    isPolygonCreated = true;

    // add guards
    guards.push(new Point(430, 190, 0, 1, []));

    // add points of the figure
    points.push(new Point(176, 214, 0, 0, []));
    points.push(new Point(321, 302, 1, 0, []));
    points.push(new Point(340, 178, 2, 0, []));
    points.push(new Point(492, 238, 3, 0, []));
    points.push(new Point(436, 42, 4, 0, []));

    //update adjList of each point and add lines of the figure
    for (let i = 1; i < points.length - 1; i++) {
      edges.push(new Edge(points[i - 1], points[i], 0));
      points[i].adjList.push(points[i - 1]);
      points[i].adjList.push(points[i + 1]);
    }
    edges.push(new Edge(points[points.length - 2], points[points.length - 1], 0));
    points[points.length - 1].adjList.push(points[points.length - 2]);
    points[points.length - 1].adjList.push(points[0]);

    edges.push(new Edge(points[points.length - 1], points[0], 0));
    points[0].adjList.push(points[1]);
    points[0].adjList.push(points[points.length - 1]);
  }

  /**
   * This method runs the whole algorithm and checks if the set of guards (in the global variable) cover all the area.
   */
  p.run = function () {
    p.delimitRegions();
    p.createRegionsSet();
    p.createWitnessSet();
    if (p.doGuardsCoverArea()) {
      document.getElementById("illustration5-result").innerHTML =
        "The guards cover all the area";
    } else {
      document.getElementById("illustration5-result").innerHTML =
        "The guards do not cover all the area";
    }
  }

  /**
   * This method displays or removes the display of the corners of each regions create by the intersection of the edgesRegions (global variable).
   */
  p.displayOrRemoveIntersection = function () {
    boolIntersection = !boolIntersection;
  }

  /**
   * This method displays or removes the display of the set of witnesses.
   */
  p.displayOrRemoveWitness = function () {
    boolWitness = !boolWitness;
  }

  /**
   * This method displays or removes the display of the decomposition of the polygon into regions.
   */
  p.displayOrRemoveRegions = function () {
    boolRegions = !boolRegions; //global variable

  }

  /**
   * This method displays or removes the display of the triangulation of the polygon
   */
  p.displayOrRemoveTriangulation = function () {
    boolTriangulation = !boolTriangulation;
  }

  /**
   * This method adds to the global variable "edgesRegions", the list of
   * the infinite line used to decompose the polygon in subregions that
   * will be used to check if the guards can see all the polygon.
   */
  p.delimitRegions = function () {
    for (let i = 0; i < guards.length; i++) {
      for (let j = 0; j < points.length; j++) {
        p.endlessLine(guards[i], points[j]);
      }
    }
    for (let i = 0; i < edges.length; i++) {
      p.endlessLine(edges[i].pt1, edges[i].pt2);
    }
  }

  /** This method adds an infinite line passing through the points pt1 and pt2 given in parameter */
  p.endlessLine = function (pt1, pt2) {
    p1 = new p5.Vector(pt1.x, pt1.y);
    p2 = new p5.Vector(pt2.x, pt2.y);
    let dia_len = new p5.Vector(p.windowWidth, p.windowHeight).mag();
    let dir_v = p5.Vector.sub(p2, p1).setMag(dia_len);
    let lp1 = p5.Vector.add(p1, dir_v);
    let lp2 = p5.Vector.sub(p1, dir_v);
    edgesRegions.push(
      new Edge(
        new Point(lp1.x, lp1.y, -1, 0, []),
        new Point(lp2.x, lp2.y, -1, 0, []),
        0
      )
    );
  }

  /** This method creates all the points that delimits the regions used
   * to prove that the art gallery problem is in the complexity class ???R.
   */
  p.createRegionsSet = function () {
    let v1;
    let v2;
    for (let i = 0; i < edgesRegions.length; i++) {
      v1 = p.createVectorFromEdge(edgesRegions[i]);
      for (let j = i + 1; j < edgesRegions.length; j++) {
        v2 = p.createVectorFromEdge(edgesRegions[j]);
        // if lines are well defined
        /*if (!isVectorNull(v)) {*/
        let det = p.determinantOfTwoVectors(v1, v2);
        let pointIntersectionRegion;
        // if lines are non-parallel
        if (det !== 0) {
          pointIntersectionRegion = p.computeIntersectionPoint(
            edgesRegions[i],
            edgesRegions[j],
            det
          );

          if (p.isInsidePolygon(pointIntersectionRegion)) {
            regionsPointsSet.push(pointIntersectionRegion);
          }
        }
        //}
      }
    }
  }

  /**
   * This method creates all the points used as witness (explained in the report).
   * These points are the centroid of triangles formed by any three points
   * in the list of the points that delimit the regions (this set of points
   * is generated by the createRegionSet method).
   */
  p.createWitnessSet = function () {
    let centroid;
    for (let i = 0; i < regionsPointsSet.length; i++) {
      for (let j = i + 1; j < regionsPointsSet.length; j++) {
        for (let k = j + 1; k < regionsPointsSet.length; k++) {
          centroid = p.createCentroid(
            regionsPointsSet[i],
            regionsPointsSet[j],
            regionsPointsSet[k]
          );
          if (p.isInsidePolygon(centroid)) witnessPointsSet.push(centroid);
        }
      }
    }
  }

  /**
   * This method checks if the list of guards cover the whole polygon by
   * checking if any witness point is see by a guard.
   */
  p.doGuardsCoverArea = function () {
    let covered = false;
    for (let i = 0; i < witnessPointsSet.length; i++) {
      covered = false;
      for (let j = 0; j < guards.length; j++) {
        if (!p.sees(guards[j], witnessPointsSet[i])) {
        } else {
          covered = true;
        }
      }
      if (!covered) {
        return false;
      }
    }
    return covered;
  }

  /**
   * This method compute the point that is at the intersection of the edge i
   * and j. To do so it uses the determinant given in parameter which is the
   * determinant of the two vectors representing the edges i and j.
   * @param {Edge} i The first edge
   * @param {Edge} j The second edge
   * @param {*} det the determinant of the two vectors representing the edges i and j
   */
  p.computeIntersectionPoint = function (i, j, det) {
    const p_i = i.pt1.x;
    const q_i = i.pt1.y;
    const p_p_i = i.pt2.x;
    const q_p_i = i.pt2.y;
    const p_j = j.pt1.x;
    const q_j = j.pt1.y;
    const p_p_j = j.pt2.x;
    const q_p_j = j.pt2.y;
    const num1 =
      (p_j * q_p_j - q_j * p_p_j) * (p_p_i - p_i) -
      (p_i * q_p_i - q_i * p_p_i) * (p_p_j - p_j);
    const num2 =
      (p_j * q_p_j - q_j * p_p_j) * (q_p_i - q_i) -
      (p_i * q_p_i - q_i * p_p_i) * (q_p_j - q_j);
    return new Point(Math.round(num1 / det), Math.round(num2 / det), -1, 0, []);
  }

  /**
   * This method computes the determinant of the vectors v1 and v2.
   * @param {Vector} v1
   * @param {Vector} v2
   */
  p.determinantOfTwoVectors = function (v1, v2) {
    return v1.u * v2.v - v2.u * v1.v;
  }

  /**
   * This method creates the vector corresponding to an edge given in parameter.
   * @param {Edge} e
   */
  p.createVectorFromEdge = function (e) {
    return new Vector(e.pt2.x - e.pt1.x, e.pt2.y - e.pt1.y);
  }

  /**
   * This method checks if a vector is null or not.
   * @param {Vector} vec
   */
  p.isVectorNull = function (vec) {
    return vec.u === 0 && vec.v === 0;
  }

  /**
   * This method checks if a guard given in parameter can see a point also
   * given in parameter
   * @param {Point} guard
   * @param {Point} point
   */
  p.sees = function (guard, point) {
    for (let i = 0; i < edges.length; i++) {
      if (p.ABIntersectsCD(guard, point, edges[i].pt1, edges[i].pt2)) {
        return false;
      }
    }
    return true;
  }

  /**
   * This method checks if the segment formed by the two points a and
   * b given in parameter intersects the segment formed by the two points
   * c and d.
   * @param {Point} a
   * @param {Point} b
   * @param {Point} c
   * @param {Point} d
   */
  p.ABIntersectsCD = function (a, b, c, d) {
    let det_adb = p.computeDeterminant(a, d, b);
    let det_dcb = p.computeDeterminant(d, c, b);
    let det_cab = p.computeDeterminant(c, a, b);
    let det_bda = p.computeDeterminant(b, d, a);
    let det_dca = p.computeDeterminant(d, c, a);
    let det_cba = p.computeDeterminant(c, b, a);
    let det_abc = p.computeDeterminant(a, b, c);
    let det_abd = p.computeDeterminant(a, b, d);
    let inside1 = p.isInside(det_adb, det_dcb, det_cab);
    let inside2 = p.isInside(det_bda, det_dca, det_cba);
    if ((det_abc > 0 && det_abd > 0) || (det_abc < 0 && det_abd < 0)) {
      return false;
    } else {
      if (inside1 === 1 || inside2 === 1) {
        return false;
      } else {
        return true;
      }
    }
  }

  /**
   * This method returns the point which represent the centro??d of the
   * triangle formed by pt1, pt2 and pt3.
   * @param {Point} pt1
   * @param {Point} pt2
   * @param {Point} pt3
   */
  p.createCentroid = function (pt1, pt2, pt3) {
    return new Point(
      (pt1.x + pt2.x + pt3.x) / 3,
      (pt1.y + pt2.y + pt3.y) / 3,
      0,
      0,
      []
    );
  }

  /**
   * This method checks if the point pt is inside the current polygon.
   * @param {Point} pt
   */
  p.isInsidePolygon = function (pt) {
    let bool = false;
    for (let i = 0; i < ears.length; i++) {
      bool = p.isInTriangle(ears[i].nghbr1, ears[i].pt, ears[i].nghbr2, pt);
      if (bool) break;
    }
    return bool;
  }

  /**
   * This method checks if the point d given in parameter is in the triangle
   * formed by the 3 points a, b and c.
   * @param {Point} a
   * @param {Point} b
   * @param {Point} c
   * @param {Point} d
   */
  p.isInTriangle = function (a, b, c, d) {
    // There must be 3 right turns to be inside triangle (if we consider clockwise orientation)
    const abd = p.computeDeterminant(a, b, d);
    const bcd = p.computeDeterminant(b, c, d);
    const cad = p.computeDeterminant(c, a, d);

    return (
      (abd <= 0 && bcd <= 0 && cad <= 0) || (abd >= 0 && bcd >= 0 && cad >= 0)
    );
  }

  /* This method applies the triangulation on the drawn polygon */
  p.applyTriangulation = function () {
    if (isPolygonCreated) {
      p.reccursiveTriangulation(points, triangulationEdges);
    } else {
      document.getElementById("illustration5-result").innerHTML =
        "The polygon is not created yet";
    }
  }

  /* This method apply the triangulation on the polygon reccursively.
  The method searches after an ear of the polygon and when it finds one,
   it "removes" it and the algo is restarted on the "new" polygon. 
   It ends when the polygon has only 3 vertices left 
   (and therefore this one is itself a triangle). */
  p.reccursiveTriangulation = function (ptsList, egsList) {
    if (ptsList.length > 3) {
      let result = p.findEar(ptsList);
      let ear = result[0];
      ears.push(ear);
      let newptsList = [...ptsList];
      newptsList.splice(result[1], 1);
      points[ear.nghbr1.number].adjList.push(points[ear.nghbr2.number]);
      points[ear.nghbr2.number].adjList.push(points[ear.nghbr1.number]);
      egsList.push(new Edge(ear.nghbr1, ear.nghbr2, 1));
      p.reccursiveTriangulation(newptsList, egsList);
    } else {
      let ear = new EarThree(ptsList[0], ptsList[1], ptsList[2]);
      ears.push(ear);
      p.triColorGraph();
    }
  }

  //TODO
  p.createPolygon = function () {
    isPolygonCreated = true;
    //add the last edge connecting edge 0 with the last one to close the polygon.

    points[0].adjList.push(points[points.length - 1]);
    points[points.length - 1].adjList.push(points[0]);
    edges.push(new Edge(points[0], points[points.length - 1], 0));
  }

  //TODO
  /* This function add a point to the list of points and call the function 
  of the exercice if needed */
  p.addPoint = function () {
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
  p.isInside = function (det1, det2, det3) {
    return (
      (det1 >= 0 && det2 >= 0 && det3 >= 0) ||
      (det1 <= 0 && det2 <= 0 && det3 <= 0)
    );
  }

  /*This function compute the determinant of the 3 points given in parameter */
  p.computeDeterminant = function (pt1, pt2, pt3) {
    let a = pt2.x - pt1.x;
    let b = pt3.x - pt1.x;
    let c = pt2.y - pt1.y;
    let d = pt3.y - pt1.y;
    let det = a * d - b * c;
    return det;
  }

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
  }

  /* This function checks if there is no concave points 
  inside the triangle formed by the points i and his 2 neighbours */
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
        result = p.isInTriangle(pt1, pt2, pt3, ptsList[j]);
        if (result) {
          break;
        }
      }
    }
    return !result;
  }

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
        }
      }
      if (earNotFound) {
        i++;
      }
    }
    return [ear, i];
  }

  /**
   * This method apply a tricoloration on the polygon (represented by the
   * global variable "points").
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
  }

  p.draw = function () {
    // Put drawings here
    p.background(200);

    //This part draws the points and lines of the polygon
    if (boolRegions) {
      p.stroke("grey");
      if (boolRegions) {
        for (let i = 0; i < edgesRegions.length; i++) {
          p.line(
            edgesRegions[i].pt1.x,
            edgesRegions[i].pt1.y,
            edgesRegions[i].pt2.x,
            edgesRegions[i].pt2.y
          );
        }
      }
    }

    p.stroke("black");
    for (let i = 0; i < edges.length; i++) {
      p.line(edges[i].pt1.x, edges[i].pt1.y, edges[i].pt2.x, edges[i].pt2.y);
    }

    let c = p.color("black");
    p.noStroke();
    p.fill(c);
    for (let i = 0; i < points.length; i++) {
      p.textSize(14);
      p.text(points[i].number, points[i].x + 5, points[i].y + 5);
      p.ellipse(points[i].x, points[i].y, 7, 7);
    }
    if (boolIntersection) {
      c = p.color("purple");
      p.fill(c);
      for (let i = 0; i < regionsPointsSet.length; i++) {
        p.ellipse(regionsPointsSet[i].x, regionsPointsSet[i].y, 7, 7);
      }
    }
    if (boolWitness) {
      c = p.color("blue");
      p.fill(c);
      for (let i = 0; i < witnessPointsSet.length; i++) {
        p.ellipse(witnessPointsSet[i].x, witnessPointsSet[i].y, 7, 7);
      }
    }

    c = p.color("red");
    p.fill(c);
    for (let i = 0; i < guards.length; i++) {
      p.ellipse(guards[i].x, guards[i].y, 7, 7);
    }

    // This part draws the lines create for the triangulation.
    if (boolTriangulation) {
      p.stroke("red");
      for (let i = 0; i < triangulationEdges.length; i++) {
        p.line(
          triangulationEdges[i].pt1.x,
          triangulationEdges[i].pt1.y,
          triangulationEdges[i].pt2.x,
          triangulationEdges[i].pt2.y
        );
      }
    }
    p.stroke("black");
  }

  // This Redraws the Canvas when resized
  p.windowResized = () => p.customResize();

  p.customResize = function () {
    const canvasContainer = document.getElementById("illustration5-canvas");
    p.resizeCanvas(canvasContainer.offsetWidth, 450);
  };
}