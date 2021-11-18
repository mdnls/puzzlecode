define("model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextGrid = exports.Grid = void 0;
    class Grid {
        constructor(Nr, Nc) {
            this.Nc = Nc;
            this.Nr = Nr;
            this.grid = Array(Nr);
            for (let i = 0; i < Nr; i++) {
                this.grid[i] = Array(Nc);
                this.grid[i].fill(" ");
            }
        }
        set(r, c, str) {
            this.grid[r][c] = str;
        }
        get(r, c) {
            return this.grid[r][c];
        }
        static from(grid) {
            let g = new Grid(grid.Nr, grid.Nc);
            g.grid = grid.grid.slice();
            return g;
        }
    }
    exports.Grid = Grid;
    class TextGrid {
        constructor(text, linewidth) {
            this.text = text;
            this.width = linewidth + 1;
            this.linewidth = linewidth;
            let lines = [];
            for (let word of text.split(" ")) {
                if (lines.length > 1 && (word.length + lines[lines.length - 1].length + 1 < this.linewidth)) {
                    lines[lines.length - 1] = lines[lines.length - 1] + " " + word;
                }
                else {
                    let fragment = word;
                    while (fragment.length > this.linewidth) {
                        if (this.linewidth == 1) {
                            lines.push(fragment.slice(0, 1));
                            fragment = fragment.slice(1);
                        }
                        else {
                            let head = fragment.slice(0, this.linewidth - 1) + "-";
                            lines.push(head);
                            fragment = fragment.slice(this.linewidth - 1);
                        }
                    }
                    lines.push(fragment);
                }
            }
            this.lines = lines;
            this.height = lines.length + 1;
            this.grid = new Grid(this.height, this.width);
            for (let i = 0; i < this.lines.length; i++) {
                for (let j = 0; j < this.lines[i].length; j++) {
                    this.grid.set(i, j, this.lines[i][j]);
                }
            }
        }
        get_lines() {
            return this.lines.slice();
        }
        get_grid() {
            return Grid.from(this.grid);
        }
        get(r, c) {
            return this.grid.get(r, c);
        }
    }
    exports.TextGrid = TextGrid;
});
define("view", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.COORDINATES = exports.LetterEdge = exports.PerimeterEdge = exports.PuzzleEdge = void 0;
    class PuzzleEdge {
        constructor(cnf, vr, vc, dir) {
            this.cnf = cnf;
            this.vr = vr;
            this.vc = vc;
            this.dir = dir;
        }
        bezier_coordinates() {
            throw Error("Subclasses must implement bezier_coordinates().");
        }
        absolute_coordinates() {
            let bezier = this.bezier_coordinates();
            let transform;
            let aff = (C) => [this.cnf.tileSideLength * (this.vc + C[0]) + this.cnf.topLeft[0], this.cnf.tileSideLength * (this.vr + C[1]) + this.cnf.topLeft[1]];
            let rotate = (C) => [-C[1], C[0]];
            let step_r = (C) => [C[0], this.cnf.tileSideLength + C[1]];
            let step_c = (C) => [C[0] + this.cnf.tileSideLength, C[1]];
            if (this.dir == "up") {
                transform = aff;
            }
            else if (this.dir == "right") {
                transform = (C) => step_c(aff(rotate(C)));
            }
            else if (this.dir == "down") {
                transform = (C) => step_r(aff(C));
            }
            else if (this.dir == "left") {
                transform = (C) => aff(rotate(C));
            }
            else {
                throw Error("Invalid this direction: " + this.dir);
            }
            return bezier.map(transform);
        }
        letter_coordinate() {
            return [this.cnf.tileSideLength * this.vc + this.cnf.topLeft[0], this.cnf.tileSideLength * this.vr + this.cnf.topLeft[0]];
        }
    }
    exports.PuzzleEdge = PuzzleEdge;
    class PerimeterEdge extends PuzzleEdge {
        bezier_coordinates() {
            return [[0, 0], [1, 0]];
        }
    }
    exports.PerimeterEdge = PerimeterEdge;
    class LetterEdge extends PuzzleEdge {
        constructor(cnf, vc, vr, dir, letter) {
            super(cnf, vc, vr, dir);
            this.letter = letter.toLowerCase();
            if (this.letter == " ") {
                let basic_edge = [[0.45, 0], [0.3, 0.3], [0.7, 0.3], [0.55, 0]];
                let random_edge = [[0, 0], [0.05, 0]];
                for (let edge of basic_edge) {
                    random_edge.push([edge[0] + Math.random() / 10, edge[1] + Math.random() / 10]);
                }
                random_edge.push([0.95, 0], [1, 0]);
                this.edge = random_edge;
            }
            else {
                this.edge = LetterEdge.edges_per_letter[this.letter];
            }
        }
        bezier_coordinates() {
            return this.edge;
        }
    }
    exports.LetterEdge = LetterEdge;
    LetterEdge.edges_per_letter = { "a": [[0.0, 0.0], [0.05, 0.0], [0.387, -0.019], [0.338, 0.211], [0.709, 0.344], [0.57, -0.116], [0.95, 0.0], [1.0, 0.0]], "b": [[0.0, 0.0], [0.05, 0.0], [0.489, -0.056], [0.281, -0.344], [0.69, -0.338], [0.488, 0.034], [0.95, 0.0], [1.0, 0.0]], "c": [[0.0, 0.0], [0.05, 0.0], [0.557, -0.079], [0.288, 0.222], [0.639, 0.254], [0.599, 0.059], [0.95, 0.0], [1.0, 0.0]], "d": [[0.0, 0.0], [0.05, 0.0], [0.45, 0.052], [0.281, -0.367], [0.685, -0.357], [0.652, -0.064], [0.95, 0.0], [1.0, 0.0]], "e": [[0.0, 0.0], [0.05, 0.0], [0.525, -0.075], [0.254, -0.316], [0.688, -0.272], [0.513, -0.021], [0.95, 0.0], [1.0, 0.0]], "f": [[0.0, 0.0], [0.05, 0.0], [0.432, -0.012], [0.231, 0.371], [0.699, 0.332], [0.567, 0.059], [0.95, 0.0], [1.0, 0.0]], "g": [[0.0, 0.0], [0.05, 0.0], [0.537, -0.067], [0.221, -0.243], [0.829, -0.323], [0.554, -0.039], [0.95, 0.0], [1.0, 0.0]], "h": [[0.0, 0.0], [0.05, 0.0], [0.422, -0.008], [0.309, -0.293], [0.716, -0.357], [0.556, -0.021], [0.95, 0.0], [1.0, 0.0]], "i": [[0.0, 0.0], [0.05, 0.0], [0.536, 0.003], [0.339, -0.294], [0.652, -0.384], [0.63, -0.005], [0.95, 0.0], [1.0, 0.0]], "j": [[0.0, 0.0], [0.05, 0.0], [0.474, 0.015], [0.271, -0.31], [0.792, -0.295], [0.414, 0.018], [0.95, 0.0], [1.0, 0.0]], "k": [[0.0, 0.0], [0.05, 0.0], [0.522, 0.052], [0.392, -0.276], [0.706, -0.291], [0.525, -0.041], [0.95, 0.0], [1.0, 0.0]], "l": [[0.0, 0.0], [0.05, 0.0], [0.562, 0.044], [0.299, -0.348], [0.71, -0.373], [0.614, -0.01], [0.95, 0.0], [1.0, 0.0]], "m": [[0.0, 0.0], [0.05, 0.0], [0.456, -0.006], [0.357, -0.267], [0.638, -0.286], [0.556, -0.079], [0.95, 0.0], [1.0, 0.0]], "n": [[0.0, 0.0], [0.05, 0.0], [0.425, 0.007], [0.318, 0.404], [0.681, 0.294], [0.582, -0.068], [0.95, 0.0], [1.0, 0.0]], "o": [[0.0, 0.0], [0.05, 0.0], [0.344, 0.003], [0.338, 0.287], [0.737, 0.275], [0.558, -0.043], [0.95, 0.0], [1.0, 0.0]], "p": [[0.0, 0.0], [0.05, 0.0], [0.535, -0.022], [0.302, -0.342], [0.69, -0.261], [0.552, 0.108], [0.95, 0.0], [1.0, 0.0]], "q": [[0.0, 0.0], [0.05, 0.0], [0.432, -0.016], [0.378, 0.347], [0.641, 0.232], [0.52, 0.039], [0.95, 0.0], [1.0, 0.0]], "r": [[0.0, 0.0], [0.05, 0.0], [0.457, -0.018], [0.361, 0.389], [0.744, 0.29], [0.568, 0.014], [0.95, 0.0], [1.0, 0.0]], "s": [[0.0, 0.0], [0.05, 0.0], [0.427, 0.119], [0.367, 0.241], [0.718, 0.203], [0.542, -0.009], [0.95, 0.0], [1.0, 0.0]], "t": [[0.0, 0.0], [0.05, 0.0], [0.455, 0.051], [0.285, -0.255], [0.723, -0.315], [0.532, -0.005], [0.95, 0.0], [1.0, 0.0]], "u": [[0.0, 0.0], [0.05, 0.0], [0.45, -0.064], [0.223, 0.27], [0.677, 0.305], [0.592, -0.019], [0.95, 0.0], [1.0, 0.0]], "v": [[0.0, 0.0], [0.05, 0.0], [0.442, 0.094], [0.343, -0.279], [0.745, -0.258], [0.467, -0.014], [0.95, 0.0], [1.0, 0.0]], "w": [[0.0, 0.0], [0.05, 0.0], [0.488, -0.107], [0.353, -0.306], [0.77, -0.353], [0.516, 0.106], [0.95, 0.0], [1.0, 0.0]], "x": [[0.0, 0.0], [0.05, 0.0], [0.41, -0.059], [0.272, -0.354], [0.671, -0.301], [0.487, -0.005], [0.95, 0.0], [1.0, 0.0]], "y": [[0.0, 0.0], [0.05, 0.0], [0.434, -0.023], [0.256, -0.262], [0.754, -0.386], [0.522, -0.027], [0.95, 0.0], [1.0, 0.0]], "z": [[0.0, 0.0], [0.05, 0.0], [0.577, 0.021], [0.282, -0.36], [0.748, -0.352], [0.551, -0.023], [0.95, 0.0], [1.0, 0.0]] };
    class COORDINATES {
        constructor(tileSideLength, topLeft) {
            if (topLeft.length != 2) {
                throw Error("Top left must be xy coordinates");
            }
            this.topLeft = topLeft;
            this.tileSideLength = tileSideLength;
        }
    }
    exports.COORDINATES = COORDINATES;
});
define("main", ["require", "exports", "d3", "jquery", "view", "model"], function (require, exports, d3, $, view_1, model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.generate = exports.main = void 0;
    function main() {
        $("#btn").on("click", generate);
    }
    exports.main = main;
    function generate() {
        $("#svg").empty();
        let text = String($("#text").val());
        let linewidth = Number($("#lw").val());
        let key = $("#showKey").is(":checked");
        let grid = new model_1.TextGrid(text, linewidth);
        console.log(grid);
        let cnf = new view_1.COORDINATES(150, [20, 20]);
        let edges = text_to_puzzle(grid, cnf);
        let lineGenerator = d3.line().curve(d3.curveBasis);
        edges.forEach(edge => {
            d3.select("#svg")
                .append("path")
                .attr("d", lineGenerator(edge.absolute_coordinates()))
                .attr("stroke", "black")
                .attr("stroke-width", "3");
        });
        if (key) {
            edges.forEach(edge => {
                d3.select("#svg")
                    .append("text")
                    .attr("x", edge.letter_coordinate()[0] + cnf.tileSideLength / 2)
                    .attr("y", edge.letter_coordinate()[1] + cnf.tileSideLength / 2)
                    .attr("class", "keyltr")
                    .html(edge.letter);
            });
        }
    }
    exports.generate = generate;
    function text_to_puzzle(text, cnf) {
        let edges = [];
        for (let i = 0; i < text.width; i++) {
            edges.push(new view_1.PerimeterEdge(cnf, 0, i, "up"));
            edges.push(new view_1.PerimeterEdge(cnf, text.height - 1, i, "down"));
        }
        for (let i = 0; i < text.width - 1; i++) {
            edges.push(new view_1.LetterEdge(cnf, text.height - 1, i, "right", " "));
        }
        for (let j = 0; j < text.height; j++) {
            edges.push(new view_1.PerimeterEdge(cnf, j, 0, "left"));
            edges.push(new view_1.PerimeterEdge(cnf, j, text.width - 1, "right"));
        }
        for (let j = 0; j < text.height - 1; j++) {
            edges.push(new view_1.LetterEdge(cnf, j, text.width - 1, "down", " "));
        }
        for (let j = 0; j < text.width - 1; j++) {
            for (let i = 0; i < text.height - 1; i++) {
                edges.push(new view_1.LetterEdge(cnf, i, j, "right", text.get(i, j)));
                edges.push(new view_1.LetterEdge(cnf, i, j, "down", text.get(i, j)));
            }
        }
        return edges;
    }
});
//# sourceMappingURL=bundle.js.map