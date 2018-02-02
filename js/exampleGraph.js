const start = function() {
  const canvas = document.querySelector('#canvas');
  canvas.width = 1000;
  canvas.height = 500;

  // graph setup
  let setup = {
    dataType: '2',
    dataPoints: 75,
    data: []
  }
  let options = {
    padding: 50,
    lineColor: '#597bc8',
    pointColor: '#597bc8',
    gridColor: '#666',
    labelColor: '#59c87b',
    labelsEvery: 10,
    labelsXAxisEvery: 10,
    labelsYAxisEvery: 10,
    gridXEvery: 10,
    gridYEvery: 10,
    xRulerSep: 5,
    gridX: true,
    gridY: true,
    points: true,
    lines: false,
    pointLabels: true,
    pointRadius: 3,
    labelsX: true,
    labelsY: true
  };
  const cGraph = new CanvasGraph(canvas, options);
  const dataGenerator = new RandomDataGenerator();

  updateData(setup.dataType);

  function update() {
    cGraph.configure(options);
    cGraph.draw(setup.data);
  }

  function updateData(value) {
    setup.dataType = value;
    setup.data = dataGenerator.get(setup.dataType, setup.dataPoints);
    update();
  }

  function updateDataPoints(value) {
    setup.dataPoints = value;
    updateData(setup.dataType);
    update();
  }

  // setup Dat.GUI
  let gui = new dat.GUI();
  let dataFolder = gui.addFolder('data');
  let graphFolder = gui.addFolder('graph');
  let gridFolder = gui.addFolder('grid');
  let axisFolder = gui.addFolder('axis');
  let colorsFolder = gui.addFolder('colors');

  dataFolder.add(setup, 'dataType', {'"totally" random': '1', 'linear with error': '2', 'logarithmic': '3', 'sinus': '4', 'lexicographic': '5', 'temperature': '6'}).name('data type').onChange(updateData);
  dataFolder.add(setup, 'dataPoints', 2, 500).step(1).name('data points').onChange(updateDataPoints);
  dataFolder.open();

  gridFolder.add(options, 'gridY').name('draw Y-grid').onChange(update);
  gridFolder.add(options, 'gridX').name('draw X-drid').onChange(update);
  gridFolder.add(options, 'gridXEvery', 1, 100).name('X-grid every').step(1).listen().onChange(update);
  gridFolder.add(options, 'gridYEvery', 1, 100).name('Y-grid every').step(1).listen().onChange(update);

  graphFolder.add(options, 'points').name('draw points').onChange(update);
  graphFolder.add(options, 'lines').name('draw lines').onChange(update);
  graphFolder.add(options, 'pointLabels').name('draw labels').onChange(update);
  graphFolder.add(options, 'pointRadius', 1, 20).step(1).name('radius of points').onChange(update);
  graphFolder.add(options, 'labelsEvery', 1, 100).step(1).name('labels every').onChange(update);

  axisFolder.add(options, 'labelsX').name('draw X-labels').onChange(update);
  axisFolder.add(options, 'labelsY').name('draw Y-labels').onChange(update);
  axisFolder.add(options, 'labelsYAxisEvery', 1, 100).step(1).name('Y-labels every').onChange(update);
  axisFolder.add(options, 'labelsXAxisEvery', 1, 100).step(1).name('X-labels every').onChange(update);

  colorsFolder.addColor(options, 'lineColor').onChange(update);
  colorsFolder.addColor(options, 'gridColor').onChange(update);
  colorsFolder.addColor(options, 'pointColor').onChange(update);
  colorsFolder.addColor(options, 'labelColor').onChange(update);

  gui.remember(options);
};

start();
