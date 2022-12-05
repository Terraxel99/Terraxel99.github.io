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

/* This class represents an ear (3 pts). */
class EarThree {
    constructor(nghbr1, pt, nghbr2) {
        this.nghbr1 = nghbr1;
        this.pt = pt;
        this.nghbr2 = nghbr2;
    }
}

/* This class represents an ear (4 pts). */
class EarFour {
    constructor(pt1, pt2, pt3, pt4) {
        this.pt1 = pt1;
        this.pt2 = pt2;
        this.pt3 = pt3;
        this.pt4 = pt4;
    }
}

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

/** This class represents a vector. */
class Vector {
    constructor(u, v) {
        this.u = u;
        this.v = v;
    }
}

// Some colors used in several scripts.
const colors = ["black", "red", "green", "blue", "yellow", "grey", "white"];
