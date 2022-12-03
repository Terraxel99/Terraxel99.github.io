/* eslint-disable no-undef, no-unused-vars */

let illustration4Sketch = function (p) {

    const coords = [
        [0,0],[1.9,0],[2,-0.5],[2,0],[3,0],[3,-0.15],[3.5,0],[4,0],[4,-12/19],[8,-18/19],[8,0],[12,0],[12,-34/21],[16,-36/21],[16,0],[18.9,0],[19,-0.5],[19,0],
        [20,0],[20,0.5],[30,0.5],[30,0.6],[20,0.6],[20,4],[19.1,4],[19,4.5],[19,4],[17+(2/6),4],[17+(2/6),4.15],[16+(5/6),4],[16,4],[16,1776/375],[12,2486/375],
        [12,4],[10.6,4],[10.6,8],[10.5,8],[10.5,4],[8,4],[8,294/47],[4,280/47],[4,4],[2.1,4],[2,4.5],[2,4],[0,4],[0,1.8],[-10,1.8],[-10,1.7],[0,1.7]
    ];
    var guards = []; //List of guards
    var points = []; //The points of the polygon
    var edges = []; //The edges of the polygon
    var isPolygonCreated = false;
    var isRaysDisplayed = false;

    p.setup = function () {
        const canvasContainer = document.getElementById("illustration4-canvas");
        let canvas = p.createCanvas(canvasContainer.offsetWidth, 450);
        canvas.mousePressed(p.addGuard);

        p.fill("black");
        p.textSize(40);
        button = p.createButton("Clear");
        button.position(10, 10);
        button.style("z-index", "3");
        button.parent("illustration4-canvas");
        button.mouseReleased(p.resetPoints);

        button2 = p.createButton("Create the polygon");
        button2.position(70, 10);
        button2.style("z-index", "3");
        button2.parent("illustration4-canvas");
        button2.mouseReleased(p.createPolygon);

        button3 = p.createButton("Compute Visibility");
        button3.position(220, 10);
        button3.style("z-index", "3");
        button3.parent("illustration4-canvas");
        button3.mouseReleased(p.computeVisibility);

        button4 = p.createButton("Display Rays");
        button4.position(365, 10);
        button3.style("z-index", "3");
        button4.parent("illustration4-canvas");
        button4.mouseReleased(p.displayRays);

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
            }
            document.getElementById("illustration4-result").innerHTML =
                "All fields of view computed";
        }else{
            document.getElementById("illustration4-result").innerHTML =
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
                intersection = p.findClosesetIntersection(grd, pt);
                newVisionEdges.push(new Edge(new Point(grd.x, grd.y), intersection, 2));

            }
            newVisionEdges.push(visionEdgesSweep[i]);
            //intersection after ith ray
            if (p.computeDeterminant(grd, pt, predecessor) > 0 && p.computeDeterminant(grd, pt, follower) > 0) {
                intersection = p.findClosesetIntersection(grd, pt);
                newVisionEdges.push(new Edge(new Point(grd.x, grd.y), intersection, 2));
            }
        }
        return newVisionEdges;
    }

    /**
     * return the first point of intersection between the ray(pt1,pt2) and the polygon
     */
    p.findClosesetIntersection = function (pt1, pt2) {
        let intersectionList = [];
        for (let i = 0; i < edges.length; i++) {
            if (p.rayFromAToBHitsSegmentCD(pt1, pt2, edges[i].pt1, edges[i].pt2)) {
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

    p.isPtInsidePolygon = function(pt){
        let nbCross = 0;
        for(let i = 0; i < edges.length; i++){
            if(p.rayFromAToBHitsSegmentCD(pt, new Point(pt.x+0.01,pt.y+0.01), edges[i].pt1, edges[i].pt2)){
                nbCross++;
            }
        }
        return nbCross % 2 === 1;
    }


    /* This function clear the list of points, the polygon and the result computed */
    p.resetPoints = function () {
        points = [];
        edges = [];
        guards = [];
        isPolygonCreated = false;
        isRaysDisplayed = false;
        document.getElementById("illustration4-result").innerHTML = "";
    };

    p.createPolygon = function () {

        if(!isPolygonCreated){
            isPolygonCreated = true;

            for(let i = 0; i< coords.length; i++){
                points.push(new Point(coords[i][0], coords[i][1],points.length, 0,));
            }

            let multiplier = 35;
            let xOffset = 400;
            let yOffset = 350;
            
            for(let i = 0; i< points.length;i++){
                points[i].x = (points[i].x * multiplier)+xOffset;
                points[i].y = (points[i].y * (-multiplier))+yOffset;
                if (i > 0) {
                    edges.push(
                        new Edge(points[i-1], points[i], 0)
                    );
                }
            }

            edges.push(new Edge(points[0], points[points.length - 1], 0));
        }
    };

    p.displayRays = function () {
        isRaysDisplayed = !isRaysDisplayed;
    }

    /* This function add guards in the canvas */
    p.addGuard = function () {
        if(p.isPtInsidePolygon(new Point(p.mouseX, p.mouseY))){
            guards.push(new Guard(p.mouseX, p.mouseY, guards.length, 1));
            document.getElementById("illustration4-result").innerHTML =
                "";
        }if(!p.isPolygonCreated){
            document.getElementById("illustration4-result").innerHTML =
                "First create the polygon";
        }
        else{
            document.getElementById("illustration4-result").innerHTML =
                "Cannot add a guard outside the polygon";
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

            if(isRaysDisplayed){
                //display his green rays
                for (let i = 0; i < currGuard.vision.length; i++) {
                    c = p.color(colors[currGuard.vision[i].color]);
                    p.stroke(c);
                    p.fill(c);
                    p.line(currGuard.vision[i].pt1.x, currGuard.vision[i].pt1.y, currGuard.vision[i].pt2.x, currGuard.vision[i].pt2.y);
                }
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
        const canvasContainer = document.getElementById("illustration4-canvas");
        p.resizeCanvas(canvasContainer.offsetWidth, 450);
    };
};
