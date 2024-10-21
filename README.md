# p5-flipdots
an API to allow p5.js to control a flip-dot display

written by Yon Maor at the Studio for Creative Inquiry, Carnegie Mellon University, Fall 2024

![Demo](./docs/tixy_demo.gif)

## setup instructions
fire up your favorite terminal, cd somewhere comfortable and clone this repo
```
$ git clone https://github.com/yonmaor1/p5-flipdots.git
$ cd p5-flipdots
```

ensure you have [npm installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). You will need npm version 16.0.0 or higher.

run
```
$ npm init -y
$ npm install body-parser@1.20.3 concurrently@9.0.1 cors@2.8.5 express@4.21.1 serialport@12.0.0
```

ensure this worked by running
```
$ npm list
```

you should see something like this:
```
p5-flipdots@1.0.0 /path/to/p5-flipdots
├── body-parser@1.20.3
├── concurrently@9.0.1
├── cors@2.8.5
├── express@4.21.1
└── serialport@12.0.0
```

to launch the program, run
```
$ node golive.js
``` 

and navigate to http://localhost:8000/ in your favorite web browser

## writing to the flipdot display
this repo implements two ways to get the flipdot display to flip dots:
1. tixy
2. canvas

**tixy** is a p5 implementation of [tixy.land](https://tixy.land/), and allows you to write pixel-based expression to control the display from the browser. 

To use it, launch the program and navigate to http://localhost:8000/tixy

The source code can be found in `./tixy/sketch.js`, but doesn't need to be edited in order to cast data in this way.

**canvas** leverages p5 to allow you to cast any existing p5 sketch onto the display. To use it, navigate to `./canvas/sketch.js` and write your p5 sketch in there, ensuring that `canvas2display()` is called at the end of the `draw()` function (or wherever you would like to cast the canvas to the display).

To use it, launch the program and navigate to http://localhost:8000/canvas

don't open both at the same time, obviously. 