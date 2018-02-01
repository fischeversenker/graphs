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
    this.config = {
      padding: 40,
      lineColor: '#bbb',
      gridColor: '#666',
      secGridColor: '#2a2a2a',
      labelColor: '#59c87b',
      labelsXEvery: 4,
      labelsYCount: 4
    };
    this.config = Object.assign(this.config, options);
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.innerWidth = canvas.width - this.config.padding * 2;
    this.innerHeight = canvas.height - this.config.padding * 2;
  }
  // expects data to be array of [[key, val], [key, val]]
  draw(data) {
    this.drawXScale(data, {grid: false});
    this.drawYScale(data, {grid: true, sep: 2});
    this.drawLinePoints(data, {labels: false, points: false});
  }
  drawXScale(data, options) {
    let defaultOptions = {
      sep: 5,
      grid: false,
      gridLineEvery: 2
    };
    options = options || {};
    options = Object.assign(defaultOptions, options);
    // start axis line
    this.ctx.strokeStyle = this.config.gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.config.padding, this.height - this.config.padding);
    this.ctx.lineTo(this.width - this.config.padding, this.height - this.config.padding);
    this.ctx.stroke();
    // end axis line
    let currX = 0;
    let lastX = currX;
    data.forEach((d, i) => {
      currX = this.getScaledX(i, data.length - 1);
      if(!options.grid) {
        let len = (i % options.sep === 0) ? 10 : 5;
        len = (i % (options.sep * 2) === 0) ? 15 : len;
        this.ctx.beginPath();
        this.ctx.moveTo(currX, this.height - this.config.padding);
        this.ctx.lineTo(currX, this.height - len - this.config.padding);
        this.ctx.stroke();
      }
      // draw labels
      if (i % this.config.labelsXEvery === 0) {
        this.drawLabel(d[0], currX, this.height - this.config.padding + 18);
      }
      if(options.grid === true) {
        this.ctx.strokeStyle = this.config.gridColor;
        if(i % (options.sep * 2) === 0) {
          this.ctx.strokeStyle = this.config.secGridColor;
        }
        this.ctx.beginPath();
        this.ctx.moveTo(currX, this.height - this.config.padding);
        this.ctx.lineTo(currX, this.config.padding);
        this.ctx.stroke();
      }
      lastX = currX;
    });
  }

  drawYScale(data, givenOptions) {
    let defaultOptions = {
      sep: 5,
      grid: false,
      gridLineEvery: 4
    };
    let options = givenOptions || {};
    options = Object.assign(defaultOptions, options);
    let max = data.reduce((acc, d) => Math.max(acc, d[1]), data[0][1]);
    // adjust separators to reasonable size
    if(givenOptions.sep && givenOptions.sep.length > 0) {
      options.sep = Math.min(max / 5, options.sep);
      options.sep = Math.min(max / 2, options.sep);
    }
    // start axis line
    this.ctx.strokeStyle = this.config.gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.config.padding, this.height - this.config.padding);
    this.ctx.lineTo(this.config.padding, this.config.padding);
    this.ctx.stroke();
    // end axis line
    let currY = 0;
    let lastY = currY;
    for(let i = 0; i < max; i += this.innerHeight / (this.config.labelsYCount - 1)) {
      currY = this.getFlippedY(this.getScaledY(i, max));
      if (!options.grid) {
        let len = (i % options.sep === 0 && i % options.sep !== 0) ? 10 : 5;
        len = (i % (options.sep * 2) === 0) ? 15 : len;
        this.ctx.beginPath();
        this.ctx.moveTo(this.config.padding, currY);
        this.ctx.lineTo(this.config.padding + len, currY);
        this.ctx.stroke();
      }
      lastY = currY;
    }
    // draw labels
    let ystep = this.innerHeight / this.config.labelsYCount;
    for(let i = 1; i <= this.config.labelsYCount; i++) {
      let y = ystep * i;
      let perc = y / this.innerHeight;
      let closestIndex = this.findClosestToPercentage(data, max, perc);
      let d = data[closestIndex];
      let l = d[1];
      l = Math.round(perc * max * 10) / 10;
      let flippedY = this.getFlippedY(y) - this.config.padding;
      this.drawLabel(l + '', this.config.padding - 4, flippedY + 4, 'right');
      if (options.grid === true) {
        // this.ctx.strokeStyle = () ? this.config.gridColor;
        this.ctx.strokeStyle = this.config.gridColor;
        if(i % options.sep !== 0) {
          this.ctx.strokeStyle = this.config.secGridColor;
        }
        this.ctx.beginPath();
        this.ctx.moveTo(this.config.padding, flippedY);
        this.ctx.lineTo(this.width - this.config.padding, flippedY);
        this.ctx.stroke();
      }
    }
  }
  drawLinePoints(data, options = {}) {
    options = Object.assign({
      labels: false,
      labelsEvery: 4,
      radius: 3,
      points: true
    }, options);
    this.clear();
    let currX = this.config.padding;
    let max = data.reduce((acc, d) => Math.max(acc, d[1]), 0);

    this.ctx.beginPath();
    this.ctx.strokeStyle = this.config.lineColor;
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(currX, this.getFlippedY(this.getScaledY(data[0][1], max)));
    let step = this.innerWidth / (data.length - 1);
    data.forEach((d, i) => {
      let y = this.getFlippedY(this.getScaledY(d[1], max));
      this.ctx.lineTo(currX, y);
      if(options.points === true) {
        this.ctx.arc(currX, y, options.radius, 0, 2 * Math.PI);
      }
      this.ctx.moveTo(currX, y);
      if(options.labels === true && i % options.labelsEvery === 0) {
        this.drawLabel(d[1], currX + 6, y - 4, 'left');
      }
      currX += step;
    });
    this.ctx.stroke();
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
    this.ctx.fillStyle = 'transparent';
    this.ctx.fillRect(0, 0, this.width, this.height);
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
}

const addDays = function(date, days = 1) {
  let d = new Date();
  d.setDate(date.getDate() + days);
  return d;
}

const start = function() {
  let data = randomData(100, 130);
  const canvas = document.querySelector('#canvas');
  canvas.width = 1000;
  canvas.height = 450;
  const cRenderer = new CanvasRenderer(canvas, {
    labelsXEvery: 20,
    labelsYCount: 4
  });
  cRenderer.draw(data);

}

start();