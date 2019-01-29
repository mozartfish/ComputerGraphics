len = (u) ->
    Math.sqrt(dot(u, u))

dot = (u, v) ->
    v[0] * u[0] + v[1] * u[1] + v[2] * u[2]

sub = (u, v) ->
    [u[0] - v[0], u[1] - v[1], u[2] - v[2]]

add = (u, v) ->
    [v[0] + u[0], v[1] + u[1], v[2] + u[2]]

mul = (s, v) ->
    [s * v[0], s * v[1], s * v[2]]

    

normalize = (v) ->
    length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
    [v[0] / length, v[1] / length, v[2] / length]


scale = (s, v) ->
    [s * v[0], s * v[1], s * v[2]]

class Sphere
    constructor: (@center, @radius) ->
    intersect: (g, d) ->
        # g is the ray origin 
        # d is the ray direction  
        c = sub(@center, g)
        s = dot(c, d)
        discr = (@radius * @radius) - dot(c, c) + s*s
        console.log(g, d, c, s, discr) if debug
        if discr < 0 
            return Infinity
        return s - Math.sqrt(discr)
    normal: (poi) ->
        normalize(sub(poi, @center))

class Plane
    constructor: (@n, @d) -> #n is the normal vector
        @n = normalize(@n)
    intersect: (g, d) ->
        #@d is referring to the distance from the origin
        # distance to the point of intersection on the plane
        (dot(g, @n) + @d) / dot(d, @n)
    normal: (poi) ->
        @n




light = [100, 100, -100]
shapes = []

shapes.push new Plane [0, 1, 0], -1.2
shapes.push new Sphere [3, 1, 10], 1
shapes.push new Sphere [0, 0, 5], 1

# g is the origin of the ray (can be the poi or the eye)
# d is the direction
findNearestObject = (g, d) ->
    near = t: Infinity
    for shape in shapes
        # t is the distance to shape
        t = shape.intersect(g, d)
        #console.log t, eye, dir
        if t > 1e-7 && t < near.t
            near.t = t
            near.shape = shape
    near

# What color is pixel x,y?
pixel = (x, y) -> 
    eye = [0, 0, 0]
    dir = normalize([x, y, 3]) #controls field of view
    #scale(255, dir)
    near = findNearestObject(eye, dir)
    if near.t < Infinity
        # poi = eye + near.t * dir 
        poi = add(eye, mul(near.t, dir))
        #computes the normal vector for the closest shape given a point of intersection
        n = near.shape.normal(poi)
        #computes the vector from the point of intersection to the light
        # we normalize the light because we want to think of the light infinitely back
        l = normalize(sub(light, poi))
        shadow = findNearestObject(poi, l)
        bright = 0
        if shadow.t == Infinity
            # dot product gives us the brightness
            bright = dot(l, n)
            console.log(dir, near, l, n, bright) if debug
    
        # if we hit something with a ray then we return a color
        return [255 * bright, 0, 0]
    return [0, 0, 255]
   
r = 2
incr = 0.025
w = 100 # w is the resolution


debug = false
if debug
    console.log pixel 1, .4
else
    for v in [-w...w]
        tr = "<tr>"
        for u in [-w...w]
            color = pixel(u / w, -v / w)
            tr += '<td style = "background:rgb('+Math.floor(color[0]) + ',' + Math.floor(color[1]) + ',' + Math.floor(color[2]) + ')"></td>'
        tr += "</tr>"
        jQuery('table').append(tr)
