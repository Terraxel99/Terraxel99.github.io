/* eslint-disable no-undef, no-unused-vars */

let illustration3Sketch = function (p) {

    /**
     * Represent a guard
     * vision = list of all maximal vision in a straight line, vision range (green rays)
     * visionP = []; //area of vision (blue area)
     */
    class Guard {
        constructor(x, y, nb, color) {
            this.x = x;
            this.y = y;
            this.number = nb;
            this.color = color; // 0 = black, 1 = red, 2 = green, 3 = blue
            this.vision = []; //list of all maximal vision in a straight line, vision range (green rays)
            this.visionP = []; //area of vision (blue area)
        }
    }

    var guards = []; //List of guards
    var points = []; //The points of the polygon
    var edges = []; //The edges of the polygon
    var isPolygonCreated = false;

    p.setup = function () {
        const canvasContainer = document.getElementById("illustration3-canvas");
        let canvas = p.createCanvas(canvasContainer.offsetWidth, 450);
        canvas.mousePressed(p.addPoint);

        p.fill("black");
        p.textSize(40);
        button = p.createButton("Clear");
        button.position(10, 10);
        button.style("z-index", "3");
        button.parent("illustration3-canvas");
        button.mouseReleased(p.resetPoints);

        button2 = p.createButton("Create polygon");
        button2.position(70, 10);
        button2.style("z-index", "3");
        button2.parent("illustration3-canvas");
        button2.mouseReleased(p.createPolygon);

        button3 = p.createButton("Compute Visibility");
        button3.position(195, 10);
        button3.style("z-index", "3");
        button3.parent("illustration3-canvas");
        button3.mouseReleased(p.computeVisibility);

    };

    /**
     * Compute de visibility for all guards by computing their vision (green rays) and visionP (blue area)
     */
    p.computeVisibility = function () {
        if (guards.length > 0 && isPolygonCreated) {
            for (let g = 0; g < guards.length; g++) {
                guards[g].vision = p.computeVision(guards[g]);

                let currV = guards[g].vision;
                for (let i = 0; i < currV.length - 1; i++) {
                    let pt1 = currV[i].pt2;
                    let pt2 = currV[i + 1].pt2;
                    guards[g].visionP.push(new Edge(pt1, pt2, 3));
                }
                guards[g].visionP.push(new Edge(currV[currV.length - 1].pt2,
                    currV[0].pt2, 3));
                //console.log(guards[g].visionP);
            }
            document.getElementById("illustration3-result").innerHTML =
                "All fields of view computed";
        }else{
            document.getElementById("illustration3-result").innerHTML =
                "Build the polygon and then place guards in it";
        }
    };

    /**
     * Return the list of all maximal vision in a straight line for a guard g (green rays)
     */
    p.computeVision = function (g) {
        let visionEdgesSweep = p.connectGuardToEachVisibleVertex(g);
        let newVisionEdges = [];

        for (let i = 0; i < visionEdgesSweep.length; i++) {
            let grd = visionEdgesSweep[i].pt1;
            let pt = visionEdgesSweep[i].pt2;
            let predecessor = pt.number === 0 ? points[points.length - 1] : points[pt.number - 1];
            let follower = pt.number === points.length - 1 ? points[0] : points[pt.number + 1];
            let intersection = null;


            //intersection before ith ray
            if (p.computeDeterminant(grd, pt, predecessor) < 0 && p.computeDeterminant(grd, pt, follower) < 0) {
                //console.log("need one more pts");
                intersection = p.findClosesetIntersection(grd, pt);
                newVisionEdges.push(new Edge(new Point(grd.x, grd.y), intersection, 2));

            }
            newVisionEdges.push(visionEdgesSweep[i]);
            //intersection after ith ray
            if (p.computeDeterminant(grd, pt, predecessor) > 0 && p.computeDeterminant(grd, pt, follower) > 0) {
                //console.log("need one more pts");
                intersection = p.findClosesetIntersection(grd, pt);
                newVisionEdges.push(new Edge(new Point(grd.x, grd.y), intersection, 2));
            }
        }
        //console.log(visionEdgesSweep);
        //console.log(newVisionEdges);
        return newVisionEdges;
    }

    /**
     * return the first point of intersection between the ray(pt1,pt2) and the polygon
     */
    p.findClosesetIntersection = function (pt1, pt2) {
        let intersectionList = [];
        for (let i = 0; i < edges.length; i++) {
            if (p.rayFromAToBHitsSegmentCD(pt1, pt2, edges[i].pt1, edges[i].pt2)) {
                //console.log("intersection");
                intersectionList.push(p.intersection(pt1, pt2, edges[i].pt1, edges[i].pt2));
            }
        }

        let distance = Infinity;
        let closestPt = null;
        for (let i = 0; i < intersectionList.length; i++) {
            let currd = p.distance(pt1, intersectionList[i]);
            if (currd < distance) {
                distance = currd;
                closestPt = intersectionList[i];
            }
        }
        return closestPt;
    }

    /**
     * compute de distance between 2 points
     */
    p.distance = function (pt1, pt2) {
        return Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
    }

    /**
     * return the intersection point between the ray(pt1,pt2) and the segment(pt3,pt4)
     */
    p.intersection = function (pt1, pt2, pt3, pt4) {
        var d = ((pt4.x - pt3.x) * (pt1.y - pt3.y) - (pt4.y - pt3.y) * (pt1.x - pt3.x)) / ((pt4.y - pt3.y) * (pt2.x - pt1.x) - (pt4.x - pt3.x) * (pt2.y - pt1.y));
        return new Point(pt1.x + d * (pt2.x - pt1.x), pt1.y + d * (pt2.y - pt1.y));
    }

    /**
     * connect the guard g to each vertex of the polygon except the one that are not visible
     */
    p.connectGuardToEachVisibleVertex = function (g) {
        let visionEdgesSweep = [];
        for (let i = 0; i < points.length; i++) {
            let currEdge = new Edge(new Point(g.x, g.y), points[i], 2);

            if (p.neverCross(currEdge)) {
                visionEdgesSweep.push(currEdge);
            }
        }
        return visionEdgesSweep;
    }

    /**
     * return true if the edge never cross the polygon
     */
    p.neverCross = function (edge) {
        for (let e = 0; e < edges.length; e++) {
            if (p.intersectABwCD(edge.pt1, edge.pt2, edges[e].pt1, edges[e].pt2)) {
                return false;
            }
        }
        //console.log(nbCross);
        return true;
    }

    /**
     * return true if the ray(a,b) hit the segment(c,d)
     */
    p.rayFromAToBHitsSegmentCD = function (a, b, c, d) {
        const aTob = p.computeDeterminant(a, b, c) * p.computeDeterminant(a, b, d) < 0;

        if (!aTob) {
            return false;
        }

        if (p.isInTriangle(a, c, d, b)) {
            return true;
        } else {
            return !p.isInTriangle(b, c, d, a);
        }
    }

    /**
     * return true if the segment(a,b) cross the segment(c,d)
     */
    p.intersectABwCD = function (a, b, c, d) {
        return (
            !p.isInTriangle(c, d, a, b) &&
            !p.isInTriangle(c, d, b, a) &&
            p.infiniteLineAB(a, b, c, d)
        );
    }

    /**
     * return true if d is in the triangle(a,b,c)
     */
    p.isInTriangle = function (a, b, c, d) {
        // There must be 3 right turns to be inside triangle (if we consider clockwise orientation)
        const abc = p.computeDeterminant(a, b, d);
        const bcd = p.computeDeterminant(b, c, d);
        const cad = p.computeDeterminant(c, a, d);

        return (abc <= 0 && bcd <= 0 && cad <= 0) || (abc >= 0 && bcd >= 0 && cad >= 0);
    }

    /**
     * return true if the infinite line passing through(a,b) cross the segment(c,d)
     */
    p.infiniteLineAB = function (a, b, c, d) {
        return !(
            (p.computeDeterminant(a, b, c) < 0 && p.computeDeterminant(a, b, d) < 0) ||
            (p.computeDeterminant(a, b, c) > 0 && p.computeDeterminant(a, b, d) > 0)
        );
    }


    /* This function clear the list of points, the polygon and the result computed */
    p.resetPoints = function () {
        points = [];
        edges = [];
        guards = [];
        isPolygonCreated = false;
        document.getElementById("illustration3-result").innerHTML = "";
    };

    p.createPolygon = function () {

        if (points.length > 2) {
            isPolygonCreated = true;

            points[0].adjList.push(points[points.length - 1]);
            points[points.length - 1].adjList.push(points[0]);
            edges.push(new Edge(points[0], points[points.length - 1], 0));
        } else {
            document.getElementById("illustration3-result").innerHTML =
                "Cannot build the polygon, it should have at least 3 points";
        }
    };

    /* This function add a point to the list of points and call the function 
    of the exercice if needed */
    p.addPoint = function () {
        if (!isPolygonCreated) {
            points.push(new Point(p.mouseX, p.mouseY, points.length, 0, []));
            if (points.length > 1) {
                points[points.length - 2].adjList.push(points[points.length - 1]);
                points[points.length - 1].adjList.push(points[points.length - 2]);
                edges.push(
                    new Edge(points[points.length - 2], points[points.length - 1], 0)
                );
            }
        } else {
            guards.push(new Guard(p.mouseX, p.mouseY, guards.length, 1));
        }
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
        //for each guard
        for (let i = 0; i < guards.length; i++) {
            let currGuard = guards[i];

            c = p.color(colors[currGuard.color]);
            p.fill(c);
            p.noStroke();
            p.textSize(14);
            //display de guard
            p.text(currGuard.number, currGuard.x + 5, currGuard.y + 5);
            p.ellipse(currGuard.x, currGuard.y, 7, 7);

            //display his green rays
            for (let i = 0; i < currGuard.vision.length; i++) {
                c = p.color(colors[currGuard.vision[i].color]);
                p.stroke(c);
                p.fill(c);
                p.line(currGuard.vision[i].pt1.x, currGuard.vision[i].pt1.y, currGuard.vision[i].pt2.x, currGuard.vision[i].pt2.y);
            }
            //display his fied of view
            for (let i = 0; i < currGuard.visionP.length; i++) {
                c = p.color(colors[currGuard.visionP[i].color]);
                p.stroke(c);
                p.fill(c);
                p.line(currGuard.visionP[i].pt1.x, currGuard.visionP[i].pt1.y, currGuard.visionP[i].pt2.x, currGuard.visionP[i].pt2.y);
            }
        }
        p.fill("black");
        p.stroke("black");
    };

    // This Redraws the Canvas when resized
    p.windowResized = () => p.customResize();

    p.customResize = function () {
        const canvasContainer = document.getElementById("illustration3-canvas");
        p.resizeCanvas(canvasContainer.offsetWidth, 450);
    };
};
