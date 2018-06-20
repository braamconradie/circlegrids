var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

console.clear();

var PI = Math.PI,
    PI2 = PI * 2,
    RATE = 30,
    CVS1 = document.querySelector('canvas:nth-child(1)'),
    CVS2 = document.querySelector('canvas:nth-child(2)'),
    CTX1 = CVS1.getContext('2d'),
    CTX2 = CVS2.getContext('2d'),
    CVS_DI = CVS1.width,

// How many cols/rows
COUNT = 8,

// Padding
PEN_PAD = CVS_DI * 0.025,

// Radius
PEN_RAD = CVS_DI / ((COUNT + 1) * 2),

// Stroke line width
STROKE = 2,

// Indicator radius
TIP_RAD = 6,

// Coloring
COLOR = '#FFF',
    COLOR_OFF = '#333';

// An input "Pen", influences the x or y of a Group's output

var Pen = function () {
  function Pen(_ref) {
    var rate = _ref.rate,
        x = _ref.x,
        y = _ref.y;

    _classCallCheck(this, Pen);

    this.di = PEN_RAD * 2;
    this.rad = PEN_RAD * 0.7;
    this.x = x * this.di;
    this.y = y * this.di;
    this.cx = this.x + this.di * 0.5;
    this.cy = this.y + this.di * 0.5;
    this.rateName = rate;
    this.rate = RATE * rate;
    this.position = 0;
  }

  _createClass(Pen, [{
    key: 'tick',
    value: function tick() {
      this.progress = this.position / this.rate;
      this._calc();
      this.position++;
    }

    // Setting the coordinates for the tip of the pen

  }, {
    key: '_calc',
    value: function _calc() {
      var deg = 360 * this.progress;
      this.tipX = this.cx + this.rad * Math.cos(deg * PI / 180);
      this.tipY = this.cy + this.rad * Math.sin(deg * PI / 180);
    }
  }]);

  return Pen;
}();

// Takes an x pen and y pen and produces an output


var Group = function () {
  function Group(penX, penY) {
    _classCallCheck(this, Group);

    this.penX = penX;
    this.penY = penY;
    this.tracker = {};
    this.progress = 0;
  }

  _createClass(Group, [{
    key: 'tick',
    value: function tick() {
      // setting the last coordinates for the output line
      this.lastX = this.x;
      this.lastY = this.y;
      // Setting the current coordinates
      this.x = this.penX.tipX + this.penY.x;
      this.y = this.penY.tipY + this.penX.y;
      // Storing the combination so we never redraw
      var key = this.lastX + '-' + this.lastY + '-' + this.x + '-' + this.y;
      // Setting draw to false if this has already been drawn
      if (this.tracker[key]) this.draw = false;
      // Setting draw to true then storing that this has been drawn
      else {
          this.tracker[key] = true;this.draw = true;
        };
      // Draw the output and the Pens
      this._draw();
      this.progress++;
    }
  }, {
    key: '_draw',
    value: function _draw() {
      this._drawPen(this.penX);
      this._drawPen(this.penY);
      this._drawOutput();
    }

    // Take a pen and draw it, its rate, and an indicator of current position

  }, {
    key: '_drawPen',
    value: function _drawPen(_ref2) {
      var rad = _ref2.rad,
          di = _ref2.di,
          x = _ref2.x,
          y = _ref2.y,
          cx = _ref2.cx,
          cy = _ref2.cy,
          tipX = _ref2.tipX,
          tipY = _ref2.tipY,
          rateName = _ref2.rateName;

      // the circle
      CTX1.lineWidth = STROKE;
      CTX1.strokeStyle = COLOR_OFF;
      CTX1.beginPath();
      CTX1.arc(cx, cy, rad, 0, PI2, false);
      CTX1.stroke();

      // The current position
      CTX1.fillStyle = COLOR;
      CTX1.strokeStyle = COLOR;
      CTX1.beginPath();
      CTX1.arc(tipX, tipY, TIP_RAD, 0, PI2, false);
      CTX1.fill();

      // the rate number
      CTX1.fillStyle = COLOR_OFF;
      CTX1.font = 'lighter ' + rad * 0.5 + 'px Helvetica';
      CTX1.textAlign = 'center';
      CTX1.textBaseline = 'middle';
      CTX1.fillText(rateName, cx, cy);
    }

    // Draw the output of the two pens

  }, {
    key: '_drawOutput',
    value: function _drawOutput() {
      // If it hasnt already been drawn yet,
      //  draw the path on the canvas that isnt erased each frame
      if (this.draw) {
        CTX2.lineWidth = STROKE;
        CTX2.strokeStyle = COLOR;
        CTX2.beginPath();
        CTX2.moveTo(this.lastX, this.lastY);
        CTX2.lineTo(this.x, this.y);
        CTX2.stroke();
      }

      // Draw the indicator on the refreshing canvas
      CTX1.fillStyle = COLOR;
      CTX1.beginPath();
      CTX1.arc(this.x, this.y, TIP_RAD, 0, PI2, false);
      CTX1.fill();
    }
  }]);

  return Group;
}();

var pensX = [],
    pensY = [],
    groups = [];

// Generating the pens
for (var x = 0; x < COUNT; x++) {
  var penX = new Pen({ rate: x + 1, x: x + 1, y: 0 }),
      penY = new Pen({ rate: x + 1, x: 0, y: x + 1 });
  pensX.push(penX);
  pensY.push(penY);
}

// Generating the groups
for (var _x = 0; _x < pensY.length; _x++) {
  for (var y = 0; y < pensX.length; y++) {
    groups.push(new Group(pensX[_x], pensY[y]));
  }
} // Start running
run();

function run() {
  // Clear the refreshing canvas
  CTX1.clearRect(0, 0, CVS_DI, CVS_DI);

  // For each pen
  for (var i = 0; i < pensX.length; i++) {
    // Tick them forward to get new coords
    pensX[i].tick();
    pensY[i].tick();

    // Draw the axis
    CTX1.lineWidth = STROKE;
    CTX1.strokeStyle = COLOR_OFF;
    CTX1.beginPath();
    CTX1.moveTo(pensX[i].tipX, 0);
    CTX1.lineTo(pensX[i].tipX, CVS_DI);
    CTX1.stroke();
    CTX1.beginPath();
    CTX1.moveTo(0, pensY[i].tipY);
    CTX1.lineTo(CVS_DI, pensY[i].tipY);
    CTX1.stroke();
  }

  // Tick each group (draws them as well)
  groups.forEach(function (group) {
    return group.tick();
  });

  // Run it again
  requestAnimationFrame(run);
}