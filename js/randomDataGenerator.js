class RandomDataGenerator {
  get(type, count) {
    switch(type) {
      case '1':
        return this.randomData1(count);
        break;
      case '2':
        return this.randomData2(count);
        break;
      case '3':
        return this.randomData3(count);
        break;
      case '4':
        return this.randomData4(count);
        break;
      case '5':
        return this.randomData5(count);
        break;
      case '6':
        return this.randomData6(count);
        break;
      default:
        return this.randomData1(count);
        break;
    }
  }

  randomData1(count = 100, max = 200) {
    let data = [];
    let startDate = new Date();

    for (let i = 0; i < count; i++) {
      data.push([
        this.ddmmyyyy(startDate),
        Math.round(Math.random() * max)
      ]);
      startDate = this.addADay(startDate);
    }

    return data;
  };
  randomData2(count = 100) {
    let data = [];
    let startX = 1;
    let startY = 1;
    for(let i = 0; i < count; i++) {
      data.push([i, i * startY + Math.random() * i]);
    }
    return data;
  };

  randomData3(count = 100) {
    let data = [];
    for(let i = 0; i < count; i++) {
      data.push([i, Math.log(i)]);
    }
    return data;
  };

  randomData4(count = 100) {
    let data = [];
    for(let i = 0; i < count/10; i+=0.1) {
      data.push([i, Math.sin(i) + 1]);
    }
    return data;
  };

  randomData5(count = 10) {
    let data = [];
    let abc = 'abcdefghijklmnopqrstuvwxyz';
    for(let i = 0; i < count; i++) {
      data.push([i, abc[i % abc.length]]);
    }
    return data;
  };

  randomData6(count = 10) {
    let data = [];
    let startDate = new Date();
    let medianT = 20;
    let maxD = 10;

    for (let i = 0; i < count; i++) {
      data.push([
        this.ddmmyyyy(startDate),
        medianT + Math.round(Math.random() * maxD) - maxD / 2
      ]);
      startDate = this.addADay(startDate);
    }
    return data;
  };

  ddmmyyyy(date) {
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();

    return [
      (dd > 9 ? '' : '0') + dd,
      (mm > 9 ? '' : '0') + mm,
      date.getFullYear()
    ].join('.');
  };

  addADay(date) {
    let d = new Date();
    d.setDate(date.getDate() + 1);
    return d;
  };

}