Date.prototype.ddmmyyyy = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    (dd>9 ? '' : '0') + dd,
    (mm>9 ? '' : '0') + mm,
    this.getFullYear()
  ].join('.');
};

class DivRenderer {
  constructor(container) {
    this.container = container;
  }
  draw(data) {
    data.forEach(d => {
      let el = document.createElement('div');
      el.innerHTML = 'Datum: ' + d[0] + '<br>Value: ' + d[1] + '<hr>';
      this.container.appendChild(el);
    });
  }
}

class CanvasRenderer {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.config = {
      padding: 40,
      lineColor: 'white'
    }
  }
  // expects data to be array of [[key, val], [key, val]]
  draw(data) {
    this.drawXScale(data);
    this.drawYScale(data);
    this.drawLinePoints(data);
  }
  drawXScale(data, sep = [5, 10]) {
    // start horizontal line
    this.ctx.strokeStyle = 'grey';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.config.padding, this.height - this.config.padding);
    this.ctx.lineTo(this.width - this.config.padding, this.height - this.config.padding);
    this.ctx.stroke();
    // end horizontal line
    data.forEach((d, i) => {
      if (i === 0) {
        // skip first to avoid lines in origin
        return;
      }
      let currX = this.getScaledX(i, data.length);
      let len = (i % sep[0] === 0) ? 10 : 5;
      if (sep.length > 1) {
        len = (i % sep[1] === 0) ? 15 : len;
      }
      this.ctx.beginPath();
      this.ctx.moveTo(currX, this.height - this.config.padding);
      this.ctx.lineTo(currX, this.height - len - this.config.padding);
      this.ctx.stroke();
      // if (labels && typeof labels[i] !== 'undefined') {
      //   this.ctx.fillStyle = 'white';
      //   this.ctx.textAlign = 'center';
      //   this.ctx.font = "14px Arial";
      //   this.ctx.fillText(labels[i], currX, this.height - this.config.padding + 20);
      // }
    });
  }

  drawYScale(data, sep = [5, 10]) {
    // start vertical line
    this.ctx.strokeStyle = 'grey';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.config.padding, this.height - this.config.padding);
    this.ctx.lineTo(this.config.padding, this.config.padding);
    this.ctx.stroke();
    // end vertical line
    let max = data.reduce((acc, d) => Math.max(acc, d[1]), data[0][1]);
    for(let i = 0; i < max; i += 5) {
      let currY = this.getScaledY(i, max);
      this.ctx.beginPath();
      this.ctx.moveTo(this.config.padding, currY);
      let len = (i % sep[0] === 0) ? 10 : 5;
      if (sep.length > 1) {
        len = (i % sep[1] === 0) ? 15 : len;
      }
      this.ctx.lineTo(this.config.padding + len, currY);
      this.ctx.stroke();
      // if (i % 10 === 0) {
      //   this.ctx.fillStyle = 'white';
      //   this.ctx.textAlign = 'right';
      //   this.ctx.font = "14px Arial";
      //   this.ctx.fillText(data[0][1], this.config.padding - 4, currY);
      // }
    }
  }
  drawLinePoints(data, scale = 10) {
    this.clear();
    let currX = this.config.padding;
    let max = data.reduce((acc, d) => Math.max(acc, d[1]), 0);

    this.ctx.beginPath();
    this.ctx.strokeStyle = this.config.lineColor;
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(currX, this.getFlippedY(this.getScaledY(data[0][1], max)));
    let step = (this.width - (this.config.padding * 2)) / data.length;
    data.forEach(d => {
      this.ctx.lineTo(currX, this.getFlippedY(this.getScaledY(d[1], max)));
      currX += step;
    });
    this.ctx.stroke();
  }
  getScaledY(y, max) {
    return y / max * (this.height - this.config.padding * 2) + this.config.padding;
  }
  getScaledX(x, max) {
    return x / max * (this.width - this.config.padding * 2) + this.config.padding;
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
  let data = randomData();
  const canvas = document.querySelector('#canvas');
  canvas.width = 1000;
  canvas.height = 450;
  const cRenderer = new CanvasRenderer(canvas);
  cRenderer.draw(data);
  
  const cont = document.querySelector('.container');
  const dRenderer = new DivRenderer(cont);
  // dRenderer.draw(data);
}

start();