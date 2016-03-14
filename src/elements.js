var exports = module.exports = {};

class Bounds {
    constructor(x, y, height, width, rotation) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;

        if (typeof(rotation) === 'undefined') rotation = 0;
        this.rotation = rotation;
    }
}

class Element {
    constructor(id, bounds) {
        this.id = id;
        this.bounds = bounds;
    }
}

class Shape extends Element {
    constructor(id, bounds) {
        super(id, bounds);
    }
}

class Rectangle extends Shape {
    constructor(id, bounds) {
        super(id, bounds);
    }
}




