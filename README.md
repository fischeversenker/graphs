# Lightweight Data Visualization Library

## Example
Clone this repository and open `example.html` for an example-graph with various options to play around with (uses Dat.Gui).

Or take a look at this [live-demo](http://fischeversenker.de/public/graphs/example.html) for the same example (might be outdated).

## Quick start
Example-Code:
```html
<head>
    <script src="js/graph.js"></script>
</head>
<body>
    <canvas id="canvas" width="400" height="400"></canvas>
    <script>
        let numbers = [0, 1, 2, 3, 4, 5, 6];
        let data = numbers.map(n1 => [n1, n1*n1]); // [[0, 0], [1, 1], [2, 4], [3, 9], ...]

        let canvas = document.querySelector('#canvas');
        let canvasGraph = new CanvasGraph(canvas, {
            gridXEvery: 1,
            gridYEvery: 1
        });
        canvasGraph.draw(data);
    </script>
</body>
```

## Options
You can pass an options-object to the `constructor` (see example code above) or set later via `graphInstance.configure(...)`.

Default options:
```javascript
{
    padding: 50,
    backgroundColor: '#151619',
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
    pointLabels: false,
    pointRadius: 3,
    labelsX: true,
    labelsY: true,
    intelligentConfig: true
}
```

## License
MIT-License. For full license text see `license.txt`.