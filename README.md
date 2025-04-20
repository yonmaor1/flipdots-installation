# p5-flipdots
an interactive flipdot installation 

written by Yon Maor at the Studio for Creative Inquiry, Carnegie Mellon University, Fall 2024

# TODO

- apply for grant (writing + budget)
- figure out location (enviorment testing, photograph spaces, reach our to facilities)
- mechanical design (sheet metal mount, acrylic enclosure, dampening)
- digital hardware (which microcontroller / computer to use, other hardware eg. camera etc.)
- modify code (lower level, 4 displays, instruction queue...)
- website (archiving instructions, maybe interactions via website?)

## tldr

We're using the following equipment: 

* [Alfa-Zeta XY5 Flipdot display, 28x14 pixels, 13.5mm dots](https://flipdots.com/en/products-services/flip-dot-boards-xy5/) (about $500)
* [USB-C to RS485/RS422 Serial Port Converter](https://www.amazon.com/OIKWAN-Converter-Adapter-Supports-Windows/dp/B0CS35249T/) ($22)
* [24V DC power supply](https://www.amazon.com/Auplf-Supply-Adapter-100-240V-Cameras/dp/B088897J2D/) ($17)

In Terminal: 

```
$ git clone https://github.com/yonmaor1/p5-flipdots.git
$ cd p5-flipdots
$ npm install
$ npm list
$ node golive.js
$ open http://localhost:8081/
```

## setup instructions
fire up your favorite terminal, cd somewhere comfortable and clone this repo
```
$ git clone https://github.com/yonmaor1/p5-flipdots.git
$ cd p5-flipdots
```

ensure you have [npm installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). You will need npm version 16.0.0 or higher.

run
```
$ npm install
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
$ node golive.js [-v : optional, enables verbose mode]
``` 

and navigate to http://localhost:8081/ in your favorite web browser

### note on dependencies breaking
sometimes (after git pulling, or running the program several times), you may get `Cannot find module 'module'` errors when trying to launch the program. Running `npm list` after this will likely show a much longer list then the one above, with many packages listed as `extraneous`. Re-running `npm install` will likely fix this.

### hardware setup

a 28x14 panel is really two 28x7 panels on top of each other, and each panel must be addressed seperately. The addresses are set via DIP switches of the back of the panels. I reccomend setting the top panel to address 0x00 (all switches OFF) and the bottom pannel to 0x3F (all switches ON). If you choose to change this for some reason, you'll need to update the `PANEL_ADDRS` variable in `lib/flipdot.js` to the correct hexadecimal representation of whatever address you choose.

## writing to the flipdot display
this repo implements two ways to get the flipdot display to flip dots: **tixy** and **canvas**

**tixy** is a p5 implementation of [tixy.land](https://tixy.land/), which allows you to write pixel-based expression to control the display from the browser. 

To use it, launch the program and navigate to http://localhost:8081/tixy

The source code can be found in `./tixy/sketch.js`, but doesn't need to be edited in order to cast data in this way.

**canvas** leverages p5 to allow you to cast any existing p5 sketch onto the display. To use it, navigate to `./canvas/sketch.js` and write your p5 sketch in there, ensuring that `canvas2display()` is called at the end of the `draw()` function (or wherever you would like to cast the canvas to the display).

To use it, launch the program and navigate to http://localhost:8081/canvas

don't open both at the same time, obviously. 

## project structure
you should only need to edit the contents of `canvas` to control the display within the scope of this project, but here is the project structure which may be helpful if you decide to fork this repo and make something crazy
```
p5-flipdots/
├── index.html # home page
├── canvas/ # the canvas control method (as described above)
│   ├── index.html
│   └── sketch.js
├── tixy/ # the tixy control method (as described above)
│   ├── index.html
│   └── sketch.js
├── libs/
│   └── flipdot.js # functions for processing data and casting to the dispaly (imported by */index.html)
│   └── server.js # launches the node server, used for serial communication (called by golive.js)
│   └── server.py # launches the python server, used to run p5 (called by golive.js)
├── golive.js # does the thing
└── node_modules, package.json, docs, assets, etc... # other stuff
```
