/* eslint-disable no-undef, no-unused-vars */

let illustration2Sketch = function (p) {
    const colorationMax = 20;
    var points = [];
    var edges = [];
    var quadrilateralizationEdges = [];
    var isPolygonCreated = false;
    var occurenceOfEachColor = [0, 0, 0, 0];

    p.setup = function () {
        const canvasContainer = document.getElementById("illustration2-canvas");
        let canvas = p.createCanvas(canvasContainer.offsetWidth, 450);
        canvas.mousePressed(p.addPoint);

        p.fill("black");
        p.textSize(40);
        button = p.createButton("Clear");
        button.position(10, 10);
        button.style("z-index", "3");
        button.parent("illustration2-canvas");
        button.mouseReleased(p.resetPoints);

        button2 = p.createButton("Create polygon");
        button2.position(70, 10);
        button2.style("z-index", "3");
        button2.parent("illustration2-canvas");
        button2.mouseReleased(p.createPolygon);

        button3 = p.createButton("Apply theorem : Kahn, Klawe, and Kleitman");
        button3.position(195, 10);
        button3.style("z-index", "3");
        button3.parent("illustration2-canvas");
        button3.mouseReleased(p.applyQuadrilateralization);

        button4 = p.createButton("Color quadrilaterals");
        button4.position(507, 10);
        button4.style("z-index", "3");
        button4.parent("illustration2-canvas");
        button4.mouseReleased(p.applyColoration);
    };

    /* This method applies the triangulation on the drawn polygon */
    p.applyQuadrilateralization = function () {
        if (isPolygonCreated) {
            let success= true;
            success = p.recursiveQuadrilateralization(points, quadrilateralizationEdges);
            if (!success) {
                document.getElementById("illustration2-result").innerHTML =
                "Failed to quadrilateralize the polygon.";
            }
        } else {
            document.getElementById("illustration2-result").innerHTML =
                "The polygon is not created yet";
        }
    };

    p.applyColoration = function () {
        if (isPolygonCreated && points.length <= colorationMax) {
            p.quadColorGraph();
            let colorGuard = p.findGuardsPosition();
            document.getElementById("illustration2-result").innerHTML =
            "The color of the guards is " + colors[colorGuard] + ".";
        } else if(points.length > colorationMax){
            document.getElementById("illustration2-result").innerHTML =
                "The polygon is to big to color (please create a polygon with less than "+ colorationMax +" vertices)";
        } else {
            document.getElementById("illustration2-result").innerHTML =
                "The polygon is not created yet";
        }
    };

    /* This function clear the list of points, the polygon and the result computed */
    p.resetPoints = function () {
        points = [];
        edges = [];
        quadrilateralizationEdges = [];
        isPolygonCreated = false;
        document.getElementById("illustration2-result").innerHTML = "";
    };

    p.createPolygon = function () {
        //add the last edge connecting edge 0 with the last one to close the polygon.

        if (points.length > 3 && points.length % 2 === 0) {
            isPolygonCreated = true;
            if (points[0].x === points[1].x) {
                points[points.length - 1].y = points[0].y;
            } else if (points[0].y === points[1].y) {
                points[points.length - 1].x = points[0].x;
            }

            points[0].adjList.push(points[points.length - 1]);
            points[points.length - 1].adjList.push(points[0]);
            edges.push(new Edge(points[0], points[points.length - 1], 0));
        } else {
            document.getElementById("illustration2-result").innerHTML =
                "Cannot build the polygon, it should have at least 4 points and the number of points should be even";
        }
    };

    /* This function add a point to the list of points and call the function 
    of the exercice if needed */
    p.addPoint = function () {
        if (!isPolygonCreated) {
            if (points.length === 0) {
                points.push(new Point(p.mouseX, p.mouseY, 0, 0, []));
            } else if (points.length === 1) {
                if (Math.abs(p.mouseX - points[0].x) > Math.abs(p.mouseY - points[0].y)) {
                    points.push(new Point(p.mouseX, points[0].y, points[points.length - 1].number + 1, 0, []));
                } else {
                    points.push(new Point(points[0].x, p.mouseY, points[points.length - 1].number + 1, 0, []));
                }
            } else {
                if (points[points.length - 2].x === points[points.length - 1].x) {
                    points.push(new Point(p.mouseX, points[points.length - 1].y, points[points.length - 1].number + 1, 0, []));
                } else if (points[points.length - 2].y === points[points.length - 1].y) {
                    points.push(new Point(points[points.length - 1].x, p.mouseY, points[points.length - 1].number + 1, 0, []));
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
    };

    /*This function check if a point is inside using the 3 determinant given 
    in parameter */
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

    /* This function checks if there is no concave points 
    inside the square formed by the points i and his 3 followers */
    p.noConcaveInside = function (i, ptsList) {
        let currEar = p.get3Following(i, ptsList);
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
                let det1 = p.computeDeterminant(currEar.pt1, currEar.pt2, ptsList[j]);
                let det2 = p.computeDeterminant(currEar.pt2, currEar.pt3, ptsList[j]);
                let det3 = p.computeDeterminant(currEar.pt3, currEar.pt1, ptsList[j]);
                result1 = p.isInside(det1, det2, det3);
                det1 = p.computeDeterminant(currEar.pt1, currEar.pt3, ptsList[j]);
                det2 = p.computeDeterminant(currEar.pt3, currEar.pt4, ptsList[j]);
                det3 = p.computeDeterminant(currEar.pt4, currEar.pt1, ptsList[j]);
                result2 = p.isInside(det1, det2, det3);
                if (result1 || result2) {
                    break;
                }
            }
        }
        return !result1 && !result2;
    };

    p.get3Following = function (i, pts) {
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
    };

    /* This function returns an ear of the polygon. */
    p.findEar = function (ptsList) {
        let ear;
        let tmpEar;
        let i = 0;
        let earNotFound = true;
        while (earNotFound) {
            tmpEar = p.get3Following(i, ptsList);
            if (p.computeDeterminant(tmpEar.pt4, tmpEar.pt1, tmpEar.pt2) < 0 &&
                p.computeDeterminant(tmpEar.pt1, tmpEar.pt2, tmpEar.pt3) < 0 &&
                p.computeDeterminant(tmpEar.pt2, tmpEar.pt3, tmpEar.pt4) < 0 &&
                p.computeDeterminant(tmpEar.pt3, tmpEar.pt4, tmpEar.pt1) < 0) {
                if (p.noConcaveInside(i, ptsList)) {
                    earNotFound = false;
                    ear = tmpEar;
                }
            }
            if (earNotFound) {
                i++;
            }
        }
        return [ear, i];
    };

    /**
     * This method tricolors the graph in O(exp) time.
     */
    p.quadColorGraph = function () {
        let correctlyColored = true;

        do {
            correctlyColored = true;
            for (let i = 0; i < points.length; i++) {

                points[i].color = Math.floor(Math.random() * 4) + 1;
                if (i != 0 && points[i].color === points[i - 1].color) {
                    correctlyColored = false;
                    break;
                }
            }

            if (correctlyColored) {
                correctlyColored = true;

                for (let i = 0; i < points.length; i++) {
                    for (let j = 0; j < points[i].adjList.length; j++) {
                        if (points[i].color === points[i].adjList[j].color) {
                            correctlyColored = false;
                            break;
                        }
                    }
                    if (!correctlyColored) {
                        break;
                    }
                }
            }

        } while (!correctlyColored);
    };

    /**
     * This method returns the number of the color of the guards and display in the html the result.
     * @returns the number of the color of the guards.
     */
    p.findGuardsPosition = function () {
        let colorGuard;
        let min = Infinity;
        for (let i = 0; i < points.length; i++) {
            occurenceOfEachColor[points[i].color - 1]++;
        }

        for (let i = 0; i < occurenceOfEachColor.length; i++) {
            if (occurenceOfEachColor[i] < min) {
                min = occurenceOfEachColor[i];
                colorGuard = i + 1;
            }
        }

        return colorGuard;
    };

    /* This method apply the quadrilateralization on the polygon reccursively.
    The method searches after an ear of the polygon and when it finds one,
     it "removes" it and the algo is restarted on the "new" polygon. 
     It ends when the polygon has only 3 vertices left 
     (and therefore this one is itself a square). */
    p.recursiveQuadrilateralization = function (ptsList, egsList) {
        let toReturn = false;
        if (ptsList.length > 4) {
            let result = p.findEar(ptsList);
            let ear = result[0];
            let newptsList = [...ptsList];
            newptsList = newptsList.filter(function (pt) {
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
            egsList.push(new Edge(ear.pt1, ear.pt4, 6));
            egsList.push(new Edge(ear.pt1, ear.pt3, 5));
            egsList.push(new Edge(ear.pt2, ear.pt4, 5));
            toReturn = p.recursiveQuadrilateralization(newptsList, egsList);
        }
        if (ptsList.length === 4 &&
            p.computeDeterminant(ptsList[3], ptsList[0], ptsList[1]) < 0 &&
            p.computeDeterminant(ptsList[0], ptsList[1], ptsList[2]) < 0 &&
            p.computeDeterminant(ptsList[1], ptsList[2], ptsList[3]) < 0 &&
            p.computeDeterminant(ptsList[2], ptsList[3], ptsList[0]) < 0) {

            points[ptsList[0].number].adjList.push(points[ptsList[2].number]);
            points[ptsList[2].number].adjList.push(points[ptsList[0].number]);
            points[ptsList[1].number].adjList.push(points[ptsList[3].number]);
            points[ptsList[3].number].adjList.push(points[ptsList[1].number]);
            egsList.push(new Edge(ptsList[0], ptsList[2], 5));
            egsList.push(new Edge(ptsList[1], ptsList[3], 5));
            toReturn = true;
        }
        return toReturn;
    };

    p.draw = function () {
        // Put drawings here
        p.background(200);

        //This part draws the points and lines of the polygon
        let c;
        for (let i = 0; i < points.length; i++) {
            c = p.color(colors[points[i].color]);
            p.fill(c);
            p.noStroke();
            p.textSize(14);
            p.text(points[i].number, points[i].x + 5, points[i].y + 5);
            p.ellipse(points[i].x, points[i].y, 7, 7);
        }
        for (let i = 0; i < edges.length; i++) {
            c = p.color(colors[edges[i].color]);
            p.stroke(c);
            p.fill(c);
            p.line(edges[i].pt1.x, edges[i].pt1.y, edges[i].pt2.x, edges[i].pt2.y);
        }

        // This part draws the lines create for the quadrilateralization.
        for (let i = 0; i < quadrilateralizationEdges.length; i++) {
            c = p.color(colors[quadrilateralizationEdges[i].color]);
            p.stroke(c);
            p.line(
                quadrilateralizationEdges[i].pt1.x,
                quadrilateralizationEdges[i].pt1.y,
                quadrilateralizationEdges[i].pt2.x,
                quadrilateralizationEdges[i].pt2.y
            );
        }
        p.fill("black");
        p.stroke("black");
    };

    // This Redraws the Canvas when resized
    p.windowResized = () => p.customResize();

    p.customResize = function () {
        const canvasContainer = document.getElementById("illustration2-canvas");
        p.resizeCanvas(canvasContainer.offsetWidth, 450);
    };
};
