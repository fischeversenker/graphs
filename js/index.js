Date.prototype.ddmmyyyy = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    (dd>9 ? '' : '0') + dd,
    (mm>9 ? '' : '0') + mm,
    this.getFullYear()
  ].join('.');
};

class CanvasRenderer {
  constructor(canvas, options) {
    let defaultConfig = {
      padding: 50,
      lineColor: '#597bc8',
      pointColor: '#597bc8',
      gridColor: '#666',
      labelColor: '#59c87b',
      labelsXEvery: 50,
      labelsXAxisEvery: 50,
      gridXEvery: 10,
      gridYEvery: 10,
      xRulerSep: 5,
      labelsYCount: 10,
      xGrid: true,
      yGrid: true,
      points: true,
      lines: true,
      pointLabels: true,
      pointRadius: 3,
      labelsX: true,
      labelsY: true
    };
    this.config = Object.assign({}, defaultConfig, options);
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.innerWidth = canvas.width - this.config.padding * 2;
    this.innerHeight = canvas.height - this.config.padding * 2;
  }
  // expects data to be array of [[key, val], [key, val]]
  draw(data) {
    // TODO: "intelligently" adjust settings to data
    this.clear();
    this.drawXScale(data);
    this.drawYScale(data, {sep: 2});
    this.drawLinePoints(data, {labels: true});
  }
  drawXScale(data) {
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
    data.forEach((d, i) => {
      currX = this.getScaledX(i, data.length - 1);
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
      if(this.config.xGrid === true && i % this.config.gridXEvery === 0) {
        this.ctx.strokeStyle = this.config.gridColor;
        this.ctx.beginPath();
        this.ctx.moveTo(currX, this.height - this.config.padding);
        this.ctx.lineTo(currX, this.config.padding);
        this.ctx.stroke();
        lastGridLine = currX;
      }
    });
  }

  drawYScale(data) {
    let max = data.reduce((acc, d) => Math.max(acc, d[1]), data[0][1]);
    // start axis line
    this.ctx.strokeStyle = this.config.gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.config.padding, this.height - this.config.padding);
    this.ctx.lineTo(this.config.padding, this.config.padding);
    this.ctx.stroke();
    // end axis line
    // draw labels
    let ystep = this.innerHeight / this.config.labelsYCount;
    for(let i = 1; i <= this.config.labelsYCount; i++) {
      let y = ystep * i;
      let perc = y / this.innerHeight;
      let closestIndex = this.findClosestToPercentage(data, max, perc);
      let flippedY = this.getFlippedY(y) - this.config.padding;
      // draw ruler
      this.ctx.beginPath();
      this.ctx.moveTo(this.config.padding, flippedY);
      this.ctx.lineTo(this.config.padding + 10, flippedY);
      this.ctx.stroke();
      // draw labels
      if (this.config.labelsY) {
        let l = Math.round(perc * max * 10) / 10;
        this.drawLabel(l + '', this.config.padding - 4, flippedY + 4, 'right');
      }
      // draw grid
      if (this.config.yGrid === true) {
        this.ctx.strokeStyle = this.config.gridColor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.config.padding, flippedY);
        this.ctx.lineTo(this.width - this.config.padding, flippedY);
        this.ctx.stroke();
      }
    }
  }
  drawLinePoints(data) {
    let currX = this.config.padding;
    let max = data.reduce((acc, d) => Math.max(acc, d[1]), 0);
    this.ctx.lineWidth = 1;

    let step = this.innerWidth / (data.length - 1);
    let lastX = this.config.padding;
    let lastY = this.getFlippedY(this.getScaledY(data[0][1], max));
    data.forEach((d, i) => {
      let y = this.getFlippedY(this.getScaledY(d[1], max));
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
      // draw lables
      if(this.config.pointLabels === true && i % this.config.labelsXEvery === 0) {
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
    this.ctx.fillText(l, x, y);
  }
  findClosestToPercentage(data, max, perc) {
    let closest = 0;
    let closestPair = data.reduce((acc, d, i) => {
      let relPerc = d[1] / max;
      let distance = Math.abs(relPerc - perc);
      if (distance < acc[0]) {
        return [distance, i];
      } else {
        return acc;
      }
    }, [data[0][1], 0]);
    closest = closestPair[1]
    return closest;
  }
  getScaledY(y, max) {
    return y / max * this.innerHeight + this.config.padding;
  }
  getScaledX(x, max) {
    return x / max * this.innerWidth + this.config.padding;
  }
  getFlippedY(y) {
    return this.height - y;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}

const randomData = function(count = 100, max = 200) {
  let data = [];
  let startDate = new Date();
  for (let i = 0; i < count; i++) {
    data.push([
      startDate.ddmmyyyy(),
      Math.round(Math.random() * max)
    ]);
    startDate = addDays(startDate);
  }
  return data;
};

const randomData2 = function(count = 100) {
  let data = [];
  let startX = 1;
  let startY = 1;
  for(let i = 0; i < count; i++) {
    data.push([i, i * startY + Math.random() * i]);
  }
  return data;
};

const randomData3 = function(count = 100) {
  let data = [];
  for(let i = 0; i < count; i++) {
    data.push([i, Math.log(i)]);
    // data.push([i, i * startY + Math.random() * i]);
  }
  return data;
};

const addDays = function(date, days = 1) {
  let d = new Date();
  d.setDate(date.getDate() + days);
  return d;
};

const start = function() {
  let data = randomData(200);
  const canvas = document.querySelector('#canvas');
  canvas.width = 1000;
  canvas.height = 500;
  const cRenderer = new CanvasRenderer(canvas);
  cRenderer.draw(data);

  let gui = new dat.GUI();
  let graph = gui.addFolder('graph');
  let grid = gui.addFolder('grid');
  let axis = gui.addFolder('axis');
  let colors = gui.addFolder('colors');

  grid.add(cRenderer.config, 'yGrid').name('draw Y-grid').onChange(update);
  grid.add(cRenderer.config, 'xGrid').name('draw X-drid').onChange(update);
  grid.add(cRenderer.config, 'gridXEvery', 1, 100).name('X-grid every').step(1).listen().onChange(update);
  grid.add(cRenderer.config, 'gridYEvery', 1, 100).name('Y-grid every').step(1).listen().onChange(update);

  graph.add(cRenderer.config, 'points').name('draw points').onChange(update);
  graph.add(cRenderer.config, 'lines').name('draw lines').onChange(update);
  graph.add(cRenderer.config, 'pointLabels').name('draw labels').onChange(update);
  graph.add(cRenderer.config, 'pointRadius', 1, 20).step(1).name('radius of points').onChange(update);
  graph.add(cRenderer.config, 'labelsXEvery', 1, 100).step(1).name('labels every').onChange(update);

  axis.add(cRenderer.config, 'labelsX').name('draw X-labels').onChange(update);
  axis.add(cRenderer.config, 'labelsY').name('draw Y-labels').onChange(update);
  axis.add(cRenderer.config, 'labelsYCount', 1, 20).step(1).name('# of Y-labels').onChange(update);
  axis.add(cRenderer.config, 'labelsXAxisEvery', 1, 100).step(1).name('X-labels every').onChange(update);

  colors.addColor(cRenderer.config, 'lineColor').onChange(update);
  colors.addColor(cRenderer.config, 'gridColor').onChange(update);
  colors.addColor(cRenderer.config, 'pointColor').onChange(update);
  colors.addColor(cRenderer.config, 'labelColor').onChange(update);

  function update() {
    window.requestAnimationFrame(() => {
      cRenderer.draw(data);
    });
  }

  gui.remember(cRenderer.config);
};

start();
