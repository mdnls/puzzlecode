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
                        let head = fragment.slice(0, this.linewidth - 1) + "-";
                        lines.push(head);
                        fragment = fragment.slice(this.linewidth - 1);
                    }
                    lines.push(fragment);
                }
            }
            this.lines = lines;
            this.height = lines.length + 1;
            this.grid = new Grid(this.width, this.height);
            for (let i = 0; i < this.lines.length - 1; i++) {
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
            let aff = (C) => [this.cnf.tileSideLength * (this.vr + C[0]) + this.cnf.topLeft[0], this.cnf.tileSideLength * (this.vc + C[1]) + this.cnf.topLeft[1]];
            let rotate = (C) => [C[1], -C[0]];
            let step_r = (C) => [C[0] + this.cnf.tileSideLength, C[1]];
            let step_c = (C) => [C[0], C[1] + this.cnf.tileSideLength];
            let rc_to_xy = (C) => [C[1], C[0]];
            if (this.dir == "up") {
                transform = aff;
            }
            else if (this.dir == "right") {
                transform = (C) => aff(rotate(C));
            }
            else if (this.dir == "down") {
                transform = (C) => step_r(aff(C));
            }
            else if (this.dir == "left") {
                transform = (C) => step_c(rotate(aff(C)));
            }
            else {
                throw Error("Invalid this direction: " + this.dir);
            }
            return bezier.map((C) => rc_to_xy(transform(C)));
        }
    }
    exports.PuzzleEdge = PuzzleEdge;
    class PerimeterEdge extends PuzzleEdge {
        bezier_coordinates() {
            return [[0, 0], [0, 1]];
        }
    }
    exports.PerimeterEdge = PerimeterEdge;
    class LetterEdge extends PuzzleEdge {
        constructor(cnf, vc, vr, dir, letter) {
            super(cnf, vc, vr, dir);
            this.letter = letter;
        }
        bezier_coordinates() {
            return [[0, 0], [0, 0.05], [0, 0.35], [0.3, 0.3], [0.4, 0.6], [0, 0.5], [0, 0.95], [0, 1]];
        }
    }
    exports.LetterEdge = LetterEdge;
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
define("main", ["require", "exports", "d3", "view", "model"], function (require, exports, d3, view_1, model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    function main() {
        let text = "z";
        let grid = new model_1.TextGrid(text, 1);
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
    }
    exports.main = main;
    function text_to_puzzle(text, cnf) {
        let edges = [];
        for (let i = 0; i < text.width; i++) {
            edges.push(new view_1.PerimeterEdge(cnf, 0, i, "up"));
            edges.push(new view_1.PerimeterEdge(cnf, text.height - 1, i, "down"));
        }
        for (let j = 0; j < text.height; j++) {
            edges.push(new view_1.PerimeterEdge(cnf, j, 0, "left"));
            edges.push(new view_1.PerimeterEdge(cnf, j, text.width - 1, "right"));
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