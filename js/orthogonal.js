/* eslint-disable no-undef, no-unused-vars */



// global variables
var points = [];
var pointsForComputation = [];
var edges = [];
var quadrilateralizationEdges = [];
var isPolygonCreated = false;
var occurenceOfEachColor = [0, 0, 0, 0, 0, 0];


function setup() {
    const canvasContainer = document.getElementById("illustration2-canvas");
    let canvas = createCanvas(canvasContainer.offsetWidth, 450);
    canvas.parent("illustration2-canvas");
    canvas.mousePressed(addPoint);

    fill("black");
    textSize(40);
    button = createButton("Clear");
    button.position(10, 10);
    button.style("z-index", "3");
    button.parent("illustration2-canvas");
    button.mouseReleased(resetpoints);

    button2 = createButton("Create polygon");
    button2.position(70, 10);
    button2.style("z-index", "3");
    button2.parent("illustration2-canvas");
    button2.mouseReleased(createPolygon);

    button3 = createButton("Apply Chvátal's watchman theorem");
    button3.position(195, 10);
    button3.style("z-index", "3");
    button3.parent("illustration2-canvas");
    button3.mouseReleased(applyQuadrilateralization);
}

/* This method applies the triangulation on the drawn polygon */
function applyQuadrilateralization() {
    if (isPolygonCreated) {
        reccursiveQuadrilateralization(points, quadrilateralizationEdges);
    } else {
        document.getElementById("illustration2-result").innerHTML =
            "The polygon is not created yet";
    }
}

/* This function clear the list of points, the polygon and the result computed */
function resetpoints() {
    points = [];
    edges = [];
    quadrilateralizationEdges = [];
    isPolygonCreated = false;
    document.getElementById("illustration2-result").innerHTML = "";
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
        } else if (points.length === 1) {
            if (Math.abs(mouseX - points[0].x) > Math.abs(mouseY - points[0].y)) {
                points.push(new Point(mouseX, points[0].y, points[points.length - 1].number + 1, 0, []));
            } else {
                points.push(new Point(points[0].x, mouseY, points[points.length - 1].number + 1, 0, []));
            }
        } else {
            if (points[points.length - 2].x === points[points.length - 1].x) {
                points.push(new Point(mouseX, points[points.length - 1].y, points[points.length - 1].number + 1, 0, []));
            } else if (points[points.length - 2].y === points[points.length - 1].y) {
                points.push(new Point(points[points.length - 1].x, mouseY, points[points.length - 1].number + 1, 0, []));
            }
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
inside the square formed by the points i and his 3 followers */
function noConcaveInside(i, ptsList) {
    let currEar = get3Following(i, ptsList);
    let result1 = false;
    let result2 = false;
    for (let j = 0; j < ptsList.length; j++) {
        if (
            ptsList[j].number !== currEar.pt1.number &&
            ptsList[j].number !== currEar.pt2.number &&
            ptsList[j].number !== currEar.pt3.number &&
            ptsList[j].number !== currEar.pt4.number
        ) {
            // This part checks if ptsList[j] is inside the triangle pt1, pt2, pt3
            let det1 = computeDeterminant(currEar.pt1, currEar.pt2, ptsList[j]);
            let det2 = computeDeterminant(currEar.pt2, currEar.pt3, ptsList[j]);
            let det3 = computeDeterminant(currEar.pt3, currEar.pt1, ptsList[j]);
            result1 = isInside(det1, det2, det3);
            det1 = computeDeterminant(currEar.pt1, currEar.pt3, ptsList[j]);
            det2 = computeDeterminant(currEar.pt3, currEar.pt4, ptsList[j]);
            det3 = computeDeterminant(currEar.pt4, currEar.pt1, ptsList[j]);
            result2 = isInside(det1, det2, det3);
            if (result1 || result2) {
                break;
            }
        }
    }
    return !result1 && !result2;
}

function get3Following(i, pts) {
    let tmpEar;
    switch (i) {
        case pts.length - 1:
            tmpEar = new EarFour(pts[pts.length - 1], pts[0], pts[1], pts[2]);
            break;
        case pts.length - 2:
            tmpEar = new EarFour(pts[pts.length - 2], pts[pts.length - 1], pts[0], pts[1]);
            break;
        case pts.length - 3:
            tmpEar = new EarFour(pts[pts.length - 3], pts[pts.length - 2], pts[pts.length - 1], pts[0]);
            break;
        default:
            tmpEar = new EarFour(pts[i], pts[i + 1], pts[i + 2], pts[i + 3]);
    }
    return tmpEar;
}

/* This function returns an ear of the polygon. */
function findEar(ptsList) {
    let ear;
    let tmpEar;
    let i = 0;
    let earNotFound = true;
    while (earNotFound) {
        tmpEar = get3Following(i, ptsList);
        console.log(tmpEar);
        if (computeDeterminant(tmpEar.pt4, tmpEar.pt1, tmpEar.pt2) < 0 &&
            computeDeterminant(tmpEar.pt1, tmpEar.pt2, tmpEar.pt3) < 0 &&
            computeDeterminant(tmpEar.pt2, tmpEar.pt3, tmpEar.pt4) < 0 &&
            computeDeterminant(tmpEar.pt3, tmpEar.pt4, tmpEar.pt1) < 0) {
            if (noConcaveInside(i, ptsList)) {
                earNotFound = false;
                ear = tmpEar;
                //colorEar(ear);
            }
        }
        if (earNotFound) {
            i++;
        }
    }
    return [ear, i];
}

/**
 * This method tricolors the graph in O(n) time.
 */
function quadColorGraph() {
    let correctlyColored = true;

    do{
        correctlyColored = true;
        for (let i = 0; i < points.length; i++) {

            points[i].color = Math.floor(Math.random() * 4) + 1;
            if( i != 0 && points[i].color === points[i-1].color){
                correctlyColored = false;
                break;
            }
        }

        if(correctlyColored){
            correctlyColored = true;

            for (let i = 0; i < points.length; i++) {
                for(let j = 0 ; j < points[i].adjList.length; j++){
                    if(points[i].color === points[i].adjList[j].color){
                        correctlyColored = false;
                        break;
                    }
                }
                if(!correctlyColored){
                    break;
                }
            }
        }

    }while(!correctlyColored);

}

/**
 * This method returns the number of the color of the guards and display in the html the result.
 * @returns the number of the color of the guards.
 */
function findGuardsPosition() {
    let min = Infinity;
    let colorGuard = 0;
    for (let i = 1; i < occurenceOfEachColor.length; i++) {
        if (occurenceOfEachColor[i] < min) colorGuard = i;
    }

    //document.getElementById("illustration2-result").innerHTML =
    //    "The color of the guards is " + colors[colorGuard] + ".";
    return colorGuard;
}

/* This method apply the quadrilateralization on the polygon reccursively.
The method searches after an ear of the polygon and when it finds one,
 it "removes" it and the algo is restarted on the "new" polygon. 
 It ends when the polygon has only 3 vertices left 
 (and therefore this one is itself a square). */
function reccursiveQuadrilateralization(ptsList, egsList) {
    if (ptsList.length > 4) {
        let result = findEar(ptsList);
        let ear = result[0];
        let newptsList = [...ptsList];
        newptsList = newptsList.filter(function( pt ) {
            return pt.number !== ear.pt2.number && pt.number !== ear.pt3.number;
        });
        //closing the square
        points[ear.pt1.number].adjList.push(points[ear.pt4.number]);
        points[ear.pt4.number].adjList.push(points[ear.pt1.number]);
        //adding the two diagonals
        points[ear.pt1.number].adjList.push(points[ear.pt3.number]);
        points[ear.pt3.number].adjList.push(points[ear.pt1.number]);
        points[ear.pt4.number].adjList.push(points[ear.pt2.number]);
        points[ear.pt2.number].adjList.push(points[ear.pt4.number]);
        //adding the 3 new edges
        egsList.push(new Edge(ear.pt1, ear.pt4, 0));
        egsList.push(new Edge(ear.pt1, ear.pt3, 5));
        egsList.push(new Edge(ear.pt2, ear.pt4, 5));
        reccursiveQuadrilateralization(newptsList, egsList);
    } else if (ptsList.length === 4) {
        points[ptsList[0].number].adjList.push(points[ptsList[2].number]);
        points[ptsList[2].number].adjList.push(points[ptsList[0].number]);
        points[ptsList[1].number].adjList.push(points[ptsList[3].number]);
        points[ptsList[3].number].adjList.push(points[ptsList[1].number]);
        egsList.push(new Edge(ptsList[0], ptsList[2], 5));
        egsList.push(new Edge(ptsList[1], ptsList[3], 5));
        quadColorGraph();
        //findGuardsPosition();
    }
}

function draw() {
    // Put drawings here
    background(200);

    //This part draws the points and lines of the polygon
    let c;
    for (let i = 0; i < points.length; i++) {
        c = color(colors[points[i].color]);
        fill(c);
        noStroke();
        textSize(14);
        text(points[i].number, points[i].x + 5, points[i].y + 5);
        ellipse(points[i].x, points[i].y, 7, 7);
    }
    for (let i = 0; i < edges.length; i++) {
        c = color(colors[edges[i].color]);
        stroke(c);
        fill(c);
        line(edges[i].pt1.x, edges[i].pt1.y, edges[i].pt2.x, edges[i].pt2.y);
    }

    // This part draws the lines create for the quadrilateralization.
    for (let i = 0; i < quadrilateralizationEdges.length; i++) {
        c = color(colors[quadrilateralizationEdges[i].color]);
        stroke(c);
        line(
            quadrilateralizationEdges[i].pt1.x,
            quadrilateralizationEdges[i].pt1.y,
            quadrilateralizationEdges[i].pt2.x,
            quadrilateralizationEdges[i].pt2.y
        );
    }
    fill("black");
    stroke("black");
}

// This Redraws the Canvas when resized
windowResized = function () {
    resize();
};

/** Toggles the modal of the illustration */
function toggleModal() {
    const modal = document.getElementById("illustration2-modal");

    if (modal.style.display === "none" || modal.style.display === "") {
        modal.style.display = "block";
        resize();
    } else {
        modal.style.display = "none";
    }
}

function resize() {
    const canvasContainer = document.getElementById("illustration2-canvas");
    resizeCanvas(canvasContainer.offsetWidth, 450);
}

document.querySelectorAll(".illustration2-toggle")?.forEach((toggle) => {
    toggle.addEventListener("click", toggleModal);
});
