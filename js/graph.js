class Graph {
  constructor() {
  }
  configure(options, defaultConfig) {
    this.defaultConfig = defaultConfig || this.defaultConfig || {};
    this.config = Object.assign({}, this.defaultConfig, options);
  }
  // expects data to be 2-dimensional array of key-value-pairs
  // [[0, a], [1, b], [2, c], ...]
  draw(data) {
    console.log(data);
  }
}

class CanvasGraph extends Graph {
  constructor(canvas, options) {
    super();
    let defaultConfig = {
      padding: 50,
      lineColor: '#597bc8',
      pointColor: '#597bc8',
      gridColor: '#666',
      labelColor: '#59c87b',
      labelsEvery: 50,
      labelsXAxisEvery: 50,
      labelsYAxisEvery: 10,
      gridXEvery: 10,
      gridYEvery: 10,
      xRulerSep: 5,
      gridX: true,
      gridY: true,
      points: true,
      lines: true,
      pointLabels: true,
      pointRadius: 3,
      labelsX: true,
      labelsY: true,
      intelligentConfig: true
    };
    this.configure(options, defaultConfig);
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.innerWidth = canvas.width - this.config.padding * 2;
    this.innerHeight = canvas.height - this.config.padding * 2;
  }
  configure(options, def) {
    super.configure(options, def);
    // fill some useful settings if not set explicitly
    if (this.config.intelligentConfig) {
      if (options.labelsXAxisEvery && !options.gridXEvery) {
        console.log('Automatically setting gridXEvery because labelsXAxisEvery got set.')
        this.config.gridXEvery = this.config.labelsXAxisEvery;
      }
      if (options.gridXEvery && !options.labelsXAxisEvery) {
        console.log('Automatically setting labelsXAxisEvery because gridXEvery got set.')
        this.config.labelsXAxisEvery = this.config.gridXEvery;
      }
      if (options.labelsYAxisEvery && !options.gridYEvery) {
        console.log('Automatically setting gridYEvery because labelsYAxisEvery got set.')
        this.config.gridYEvery = this.config.labelsYAxisEvery;
      }
      if (options.gridYEvery && !options.labelsYAxisEvery) {
        console.log('Automatically setting labelsYAxisEvery because gridYEvery got set.')
        this.config.labelsYAxisEvery = this.config.gridYEvery;
      }
    }
  }
  draw(data) {
    this.data = data;
    this.dataProperties = {
      nominal: typeof this.data[0][1] !== 'number'
    };
    // if values are nominal provide set of values
    if (this.dataProperties.nominal) {
      this.dataSet = new Set();
      this.data.forEach(d => {
        this.dataSet.add(d[1]);
      });
    }
    if (this.config.intelligentConfig && this.dataProperties.nominal) {
      console.log('Values seem to be nominal...\nAutomatically showing labels and gridlines for every value and hiding lines in graph.')
      this.config.labelsYAxisEvery = 1;
      this.config.gridYEvery = 1;
      this.config.lines = false;
    }
    this.clear();
    this.drawXScale();
    this.drawYScale();
    this.drawGraph();
  }
  drawXScale() {
    // start axis line
    this.ctx.strokeStyle = this.config.gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.config.padding, this.height - this.config.padding);
    this.ctx.lineTo(this.width - this.config.padding, this.height - this.config.padding);
    this.ctx.stroke();
    // end axis line
    let currX = 0;
    let lastGridLine = currX;
    this.data.forEach((d, i) => {
      currX = this.getScaledX(i, this.data.length - 1);
      // draw ruler
      let len = (i % this.config.xRulerSep === 0) ? 10 : 5;
      len = (i % (this.config.xRulerSep * 2) === 0) ? 15 : len;
      this.ctx.beginPath();
      this.ctx.moveTo(currX, this.height - this.config.padding);
      this.ctx.lineTo(currX, this.height - len - this.config.padding);
      this.ctx.stroke();
      // draw labels
      if (this.config.labelsX && i % this.config.labelsXAxisEvery === 0) {
        this.drawLabel(d[0], currX, this.height - this.config.padding + 18);
      }
      // draw grid
      if(this.config.gridX === true && i % this.config.gridXEvery === 0) {
        this.ctx.strokeStyle = this.config.gridColor;
        this.ctx.beginPath();
        this.ctx.moveTo(currX, this.height - this.config.padding);
        this.ctx.lineTo(currX, this.config.padding);
        this.ctx.stroke();
        lastGridLine = currX;
      }
    });
  }

  // TODO: Setting labelsYAxisEvery = 10 draws a label for every 10th datapoint.
  // Should instead draw at every 10th increment.
  // TODO: Lower bound is always 0. Implement intelligent lower bound. See temperature-graph.
  drawYScale() {
    let max = this.data.reduce((acc, d) => acc > d[1] ? acc : d[1], this.data[0][1]);
    // start axis line
    this.ctx.strokeStyle = this.config.gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.config.padding, this.height - this.config.padding);
    this.ctx.lineTo(this.config.padding, this.config.padding);
    this.ctx.stroke();
    // end axis line
    let maxYSteps = !this.dataProperties.nominal ? this.data.length : this.dataSet.size;
    for (let i = 0; i < maxYSteps; i++) {
      let d = this.data[i];
      let y = i / (maxYSteps - 1) * this.innerHeight;
      let perc = y / this.innerHeight;
      let flippedY = this.getFlippedY(y + this.config.padding);
      // draw ruler
      if (!this.config.gridY) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.config.padding, flippedY);
        this.ctx.lineTo(this.config.padding + 10, flippedY);
        this.ctx.stroke();
      }
      // draw labels
      if (this.config.labelsY === true && i % this.config.labelsYAxisEvery === 0) {
        let l = d[1];
        if (!this.dataProperties.nominal) {
          l = perc * max;
        }
        this.drawLabel(l, this.config.padding - 4, flippedY + 4, 'right');
      }
      // draw grid
      if (this.config.gridY === true && i % this.config.gridYEvery === 0) {
        this.ctx.strokeStyle = this.config.gridColor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.config.padding, flippedY);
        this.ctx.lineTo(this.width - this.config.padding, flippedY);
        this.ctx.stroke();
      }
    }
  }
  drawGraph() {
    let currX = this.config.padding;
    let max = this.data.reduce((acc, d) => acc > d[1] ? acc : d[1], this.data[0][1]);
    this.ctx.lineWidth = 1;

    let step = this.innerWidth / (this.data.length - 1);
    let ystep = this.innerHeight / (this.data.length - 1);
    let lastX = this.config.padding;
    let lastY = this.getFlippedY(this.config.padding);
    if (!this.dataProperties.nominal) {
      lastY = this.getFlippedY(this.getScaledY(this.data[0][1], max));
    }
    this.data.forEach((d, i) => {
      let y;
      if (!this.dataProperties.nominal) {
        y = this.getFlippedY(this.getScaledY(d[1], max));
      } else {
        y = this.getFlippedY(this.getScaledY([...this.dataSet].indexOf(d[1]), this.dataSet.size - 1));
      }
      // draw lines
      if(this.config.lines === true) {
        this.ctx.strokeStyle = this.config.lineColor;
        this.ctx.beginPath();
        this.ctx.moveTo(lastX, lastY);
        this.ctx.lineTo(currX, y);
        this.ctx.stroke();
      }
      // draw points
      if(this.config.points === true) {
        this.ctx.strokeStyle = this.config.pointColor;
        this.ctx.beginPath();
        this.ctx.moveTo(currX, y);
        this.ctx.arc(currX, y, this.config.pointRadius, 0, 2 * Math.PI);
        this.ctx.moveTo(currX, y);
        this.ctx.stroke();
      }
      // draw labels
      if(this.config.pointLabels === true && i % this.config.labelsEvery === 0) {
        this.ctx.strokeStyle = this.config.labelColor;
        this.ctx.beginPath();
        this.ctx.moveTo(currX, y);
        this.ctx.lineTo(currX, y - 40);
        this.drawLabel(d[1], currX, y - 40, 'left');
        this.ctx.stroke();
      }
      // update xs and ys
      lastX = currX;
      lastY = y;
      currX += step;
    });
  }
  drawLabel(l, x, y, align = 'center') {
    this.ctx.fillStyle = this.config.labelColor;
    this.ctx.textAlign = align;
    this.ctx.font = "14px Arial";
    // round to two digits if label is number
    if (typeof l === 'number') {
      l = Math.round(l * 100) / 100;
    }
    this.ctx.fillText(l, x, y);
  }
  getScaledY(y, max) {
    return (y / max * this.innerHeight) + this.config.padding;
  }
  getScaledX(x, max) {
    return (x / max * this.innerWidth) + this.config.padding;
  }
  getFlippedY(y) {
    return this.height - y;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}