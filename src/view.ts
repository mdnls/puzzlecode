import {TextGrid, Grid} from 'model';
import { ScriptElementKindModifier } from '../node_modules/typescript/lib/typescript';
/*
View responsibilities 
1. View a grid as a puzzle 
	- For each line, draw the line 
	- Manage the label<->svg dictionary 
	- Dictionary is unidirectional "label" -> lambda x, y: line-between-(x,y) 
*/

export abstract class PuzzleEdge {
	readonly cnf: COORDINATES;
	readonly vc: number;
	readonly vr: number;
	readonly dir: string; 
	readonly letter: string;
	constructor(cnf: COORDINATES, vr: number, vc: number, dir: string) {
		this.cnf = cnf;
		this.vr = vr;
		this.vc = vc;
		this.dir = dir; 
	}
	public bezier_coordinates(): [number, number][] {
		/*
                  0        x-axis      1
		0 x--------------------| 
		  |
		y |
		| |
		a |
		x |
		i |
		s |
		  |
		1 -
		*/
		throw Error("Subclasses must implement bezier_coordinates().");
	}

	public absolute_coordinates(): [number, number][] {
		let bezier = this.bezier_coordinates();
		let transform: (C: [number, number]) => [number, number];

		let aff : ((C:[number, number]) => [number, number]) = (C: [number, number]) => [this.cnf.tileSideLength * (this.vc + C[0]) + this.cnf.topLeft[0], this.cnf.tileSideLength*(this.vr + C[1]) + this.cnf.topLeft[1]];
		let rotate : ((C:[number, number]) => [number, number]) = (C: [number, number]) => [-C[1], C[0]];
		let step_r : ((C:[number, number]) => [number, number])  = (C: [number, number]) => [C[0], this.cnf.tileSideLength + C[1]];
		let step_c : ((C:[number, number]) => [number, number]) = (C: [number, number]) => [C[0] + this.cnf.tileSideLength, C[1]];
 
		if(this.dir == "up") {
			transform = aff;
		}
		else if(this.dir == "right") {
			transform = (C: [number, number]) => step_c(aff(rotate(C)));
		}
		else if(this.dir == "down") {
			transform = (C: [number, number]) => step_r(aff(C));
		}
		else if(this.dir == "left") {
			transform = (C: [number, number]) => aff(rotate(C));
		}
		else {
			throw Error("Invalid this direction: " + this.dir);
		}
		return bezier.map(transform);
	}

	public letter_coordinate(): [number, number] {
		return [this.cnf.tileSideLength * this.vc + this.cnf.topLeft[0], this.cnf.tileSideLength * this.vr + this.cnf.topLeft[0]];
	}
}

export class PerimeterEdge extends PuzzleEdge {
	public bezier_coordinates(): [number, number][] {
		return [[0, 0], [1, 0]]
	}
}

export class LetterEdge extends PuzzleEdge {
	readonly letter: string;
	static edges_per_letter: {[id: string]: [number, number][]} = {"a": [[0.0, 0.0], [0.05, 0.0], [0.387, -0.019], [0.338, 0.211], [0.709, 0.344], [0.57, -0.116], [0.95, 0.0], [1.0, 0.0]], "b": [[0.0, 0.0], [0.05, 0.0], [0.489, -0.056], [0.281, -0.344], [0.69, -0.338], [0.488, 0.034], [0.95, 0.0], [1.0, 0.0]], "c": [[0.0, 0.0], [0.05, 0.0], [0.557, -0.079], [0.288, 0.222], [0.639, 0.254], [0.599, 0.059], [0.95, 0.0], [1.0, 0.0]], "d": [[0.0, 0.0], [0.05, 0.0], [0.45, 0.052], [0.281, -0.367], [0.685, -0.357], [0.652, -0.064], [0.95, 0.0], [1.0, 0.0]], "e": [[0.0, 0.0], [0.05, 0.0], [0.525, -0.075], [0.254, -0.316], [0.688, -0.272], [0.513, -0.021], [0.95, 0.0], [1.0, 0.0]], "f": [[0.0, 0.0], [0.05, 0.0], [0.432, -0.012], [0.231, 0.371], [0.699, 0.332], [0.567, 0.059], [0.95, 0.0], [1.0, 0.0]], "g": [[0.0, 0.0], [0.05, 0.0], [0.537, -0.067], [0.221, -0.243], [0.829, -0.323], [0.554, -0.039], [0.95, 0.0], [1.0, 0.0]], "h": [[0.0, 0.0], [0.05, 0.0], [0.422, -0.008], [0.309, -0.293], [0.716, -0.357], [0.556, -0.021], [0.95, 0.0], [1.0, 0.0]], "i": [[0.0, 0.0], [0.05, 0.0], [0.536, 0.003], [0.339, -0.294], [0.652, -0.384], [0.63, -0.005], [0.95, 0.0], [1.0, 0.0]], "j": [[0.0, 0.0], [0.05, 0.0], [0.474, 0.015], [0.271, -0.31], [0.792, -0.295], [0.414, 0.018], [0.95, 0.0], [1.0, 0.0]], "k": [[0.0, 0.0], [0.05, 0.0], [0.522, 0.052], [0.392, -0.276], [0.706, -0.291], [0.525, -0.041], [0.95, 0.0], [1.0, 0.0]], "l": [[0.0, 0.0], [0.05, 0.0], [0.562, 0.044], [0.299, -0.348], [0.71, -0.373], [0.614, -0.01], [0.95, 0.0], [1.0, 0.0]], "m": [[0.0, 0.0], [0.05, 0.0], [0.456, -0.006], [0.357, -0.267], [0.638, -0.286], [0.556, -0.079], [0.95, 0.0], [1.0, 0.0]], "n": [[0.0, 0.0], [0.05, 0.0], [0.425, 0.007], [0.318, 0.404], [0.681, 0.294], [0.582, -0.068], [0.95, 0.0], [1.0, 0.0]], "o": [[0.0, 0.0], [0.05, 0.0], [0.344, 0.003], [0.338, 0.287], [0.737, 0.275], [0.558, -0.043], [0.95, 0.0], [1.0, 0.0]], "p": [[0.0, 0.0], [0.05, 0.0], [0.535, -0.022], [0.302, -0.342], [0.69, -0.261], [0.552, 0.108], [0.95, 0.0], [1.0, 0.0]], "q": [[0.0, 0.0], [0.05, 0.0], [0.432, -0.016], [0.378, 0.347], [0.641, 0.232], [0.52, 0.039], [0.95, 0.0], [1.0, 0.0]], "r": [[0.0, 0.0], [0.05, 0.0], [0.457, -0.018], [0.361, 0.389], [0.744, 0.29], [0.568, 0.014], [0.95, 0.0], [1.0, 0.0]], "s": [[0.0, 0.0], [0.05, 0.0], [0.427, 0.119], [0.367, 0.241], [0.718, 0.203], [0.542, -0.009], [0.95, 0.0], [1.0, 0.0]], "t": [[0.0, 0.0], [0.05, 0.0], [0.455, 0.051], [0.285, -0.255], [0.723, -0.315], [0.532, -0.005], [0.95, 0.0], [1.0, 0.0]], "u": [[0.0, 0.0], [0.05, 0.0], [0.45, -0.064], [0.223, 0.27], [0.677, 0.305], [0.592, -0.019], [0.95, 0.0], [1.0, 0.0]], "v": [[0.0, 0.0], [0.05, 0.0], [0.442, 0.094], [0.343, -0.279], [0.745, -0.258], [0.467, -0.014], [0.95, 0.0], [1.0, 0.0]], "w": [[0.0, 0.0], [0.05, 0.0], [0.488, -0.107], [0.353, -0.306], [0.77, -0.353], [0.516, 0.106], [0.95, 0.0], [1.0, 0.0]], "x": [[0.0, 0.0], [0.05, 0.0], [0.41, -0.059], [0.272, -0.354], [0.671, -0.301], [0.487, -0.005], [0.95, 0.0], [1.0, 0.0]], "y": [[0.0, 0.0], [0.05, 0.0], [0.434, -0.023], [0.256, -0.262], [0.754, -0.386], [0.522, -0.027], [0.95, 0.0], [1.0, 0.0]], "z": [[0.0, 0.0], [0.05, 0.0], [0.577, 0.021], [0.282, -0.36], [0.748, -0.352], [0.551, -0.023], [0.95, 0.0], [1.0, 0.0]]};
	readonly edge: [number, number][]
	constructor(cnf: COORDINATES, vc: number, vr: number, dir: string, letter: string) {
		super(cnf, vc, vr, dir);
		this.letter = letter.toLowerCase();
		if(this.letter == " ") {
			let basic_edge: [number, number][] = [[0.45, 0], [0.3, 0.3], [0.7, 0.3], [0.55, 0]];
			let random_edge: [number, number][] = [[0, 0], [0.05, 0]];
			for(let edge of basic_edge) {
				random_edge.push([edge[0] + Math.random()/10, edge[1] + Math.random()/10]);
			}
			random_edge.push([0.95, 0], [1, 0]);
			this.edge = random_edge;
		}
		else {
			this.edge = LetterEdge.edges_per_letter[this.letter];
		}
	}

	public bezier_coordinates(): [number, number][] {
		return this.edge
	}

}


export class COORDINATES {
	public tileSideLength: number;
	public topLeft: [number, number];
	constructor(tileSideLength: number, topLeft: [number, number]) {
		if(topLeft.length != 2) {
			throw Error("Top left must be xy coordinates");
		}
		this.topLeft = topLeft;
		this.tileSideLength = tileSideLength;
	}
}