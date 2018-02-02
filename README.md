# Lightweight Data Visualization Library

## Minimal example:

```html
<head>
    <script src="js/graph.js"></script>
</head>
<body>
    <canvas id="canvas" width="400" height="400"></canvas>
    <script>
        let numbers = [0, 1, 2, 3, 4, 5, 6];
        let data = numbers.map(n1 => [n1, n1*n1]);

        let canvasGraph = new CanvasGraph(document.querySelector('#canvas'), {
            gridXEvery: 1,
            gridYEvery: 1}
        );
        canvasGraph.draw(data);
    </script>
</body>
```