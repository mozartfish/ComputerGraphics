let len = u => Math.sqrt(dot(u, u));

var dot = (u, v) => (v[0] * u[0]) + (v[1] * u[1]) + (v[2] * u[2]);

let sub = (u, v) => [u[0] - v[0], u[1] - v[1], u[2] - v[2]];

let add = (u, v) => [v[0] + u[0], v[1] + u[1], v[2] + u[2]];

let mul = (s, v) => [s * v[0], s * v[1], s * v[2]];

    

let normalize = function(v) {
    let length = Math.sqrt((v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2]));
    return [v[0] / length, v[1] / length, v[2] / length];
};


let scale = (s, v) => [s * v[0], s * v[1], s * v[2]];

class Sphere {
    constructor(center, radius) {
        this.center = center;
        this.radius = radius;
    }
    intersect(g, d) {
        // g is the ray origin 
        // d is the ray direction  
        let c = sub(this.center, g);
        let s = dot(c, d);
        let discr = ((this.radius * this.radius) - dot(c, c)) + (s*s);
        if (debug) { console.log(g, d, c, s, discr); }
        if (discr < 0) { 
            return Infinity;
        }
        return s - Math.sqrt(discr);
    }
    normal(poi) {
        return normalize(sub(poi, this.center));
    }
}

class Plane {
    constructor(n, d) { //n is the normal vector
        this.n = n;
        this.d = d;
        this.n = normalize(this.n);
    }
    intersect(g, d) {
        //@d is referring to the distance from the origin
        // distance to the point of intersection on the plane
        return (dot(g, this.n) + this.d) / dot(d, this.n);
    }
    normal(poi) {
        return this.n;
    }
}




let light = [100, 100, -100];
let shapes = [];

shapes.push(new Plane([0, 1, 0], -1.2));
shapes.push(new Sphere([3, 1, 10], 1));
shapes.push(new Sphere([0, 0, 5], 1));

// g is the origin of the ray (can be the poi or the eye)
// d is the direction
let findNearestObject = function(g, d) {
    let near = {t: Infinity};
    for (let shape of shapes) {
        // t is the distance to shape
        let t = shape.intersect(g, d);
        //console.log t, eye, dir
        if (t > 1e-7 && t < near.t) {
            near.t = t;
            near.shape = shape;
        }
    }
    return near;
};

// What color is pixel x,y?
let pixel = function(x, y) { 
    let eye = [0, 0, 0];
    let dir = normalize([x, y, 3]); //controls field of view
    //scale(255, dir)
    let near = findNearestObject(eye, dir);
    if (near.t < Infinity) {
        // poi = eye + near.t * dir 
        let poi = add(eye, mul(near.t, dir));
        //computes the normal vector for the closest shape given a point of intersection
        let n = near.shape.normal(poi);
        //computes the vector from the point of intersection to the light
        // we normalize the light because we want to think of the light infinitely back
        let l = normalize(sub(light, poi));
        let shadow = findNearestObject(poi, l);
        let bright = 0;
        if (shadow.t === Infinity) {
            // dot product gives us the brightness
            bright = dot(l, n);
            if (debug) { console.log(dir, near, l, n, bright); }
        }
    
        // if we hit something with a ray then we return a color
        return [255 * bright, 0, 0];
    }
    return [0, 0, 255];
};
   
let r = 2;
let incr = 0.025;
let w = 100; // w is the resolution


var debug = false;
if (debug) {
    console.log(pixel(1, .4));
} else {
    for (let v of __range__(-w, w, false)) {
        let tr = "<tr>";
        for (let u of __range__(-w, w, false)) {
            let color = pixel(u / w, -v / w);
            tr += `<td style = "background:rgb(${Math.floor(color[0])},${Math.floor(color[1])},${Math.floor(color[2])})"></td>`;
        }
        tr += "</tr>";
        jQuery('table').append(tr);
    }
}

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}