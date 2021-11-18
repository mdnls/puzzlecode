import * as d3 from "d3";
import * as $ from "jquery";
import { LetterEdge, PerimeterEdge, PuzzleEdge, COORDINATES } from "./view";
import { TextGrid } from "./model";
import { line } from "d3-shape";

export function main() {
    $("#btn").on("click", generate);
}
export function generate() {
    $("#svg").empty()
    let text: string = String($("#text").val());
    let linewidth: number = Number($("#lw").val());
    let key: boolean = $("#showKey").is(":checked");

    let grid = new TextGrid(text, linewidth);
    console.log(grid);
    let cnf = new COORDINATES(150, [20, 20]);

    let edges = text_to_puzzle(grid, cnf);
    let lineGenerator = d3.line().curve(d3.curveBasis);
    

    edges.forEach(edge => {
        d3.select("#svg")
          .append("path")
          .attr("d", lineGenerator(edge.absolute_coordinates()))
          .attr("stroke", "black")
          .attr("stroke-width", "3");
    });

    if(key) {
        edges.forEach(edge => {
            d3.select("#svg")
              .append("text")
              .attr("x", edge.letter_coordinate()[0] + cnf.tileSideLength/2)
              .attr("y", edge.letter_coordinate()[1] + cnf.tileSideLength/2)
              .attr("class", "keyltr")
              .html(edge.letter);
        });
    }
}

function text_to_puzzle(text: TextGrid, cnf: COORDINATES) {
    let edges: PuzzleEdge[] = [];

    for(let i=0; i < text.width; i++) {
        edges.push(new PerimeterEdge(cnf, 0, i, "up"));
        edges.push(new PerimeterEdge(cnf, text.height-1, i, "down"));
        
    }
    for(let i=0; i < text.width - 1; i++) {
        edges.push(new LetterEdge(cnf, text.height-1, i, "right", " "));
    }

    for(let j=0; j < text.height; j++) {
        edges.push(new PerimeterEdge(cnf, j, 0, "left"));
        edges.push(new PerimeterEdge(cnf, j, text.width-1, "right"));
    }
    for(let j=0; j < text.height - 1; j++) {
          edges.push(new LetterEdge(cnf, j, text.width-1, "down", " "));
    }
    for(let j=0; j< text.width - 1; j++) {
        for(let i=0; i < text.height - 1; i++) {
            edges.push(new LetterEdge(cnf, i, j, "right", text.get(i, j)));
            edges.push(new LetterEdge(cnf, i, j, "down", text.get(i, j)));
        }
    }
    return edges;
}