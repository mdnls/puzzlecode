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
	constructor(cnf: COORDINATES, vr: number, vc: number, dir: string) {
		this.cnf = cnf;
		this.vr = vr;
		this.vc = vc;
		this.dir = dir; 
	}
	public bezier_coordinates(): [number, number][] {
		throw Error("Subclasses must implement bezier_coordinates().");
	}

	public absolute_coordinates(): [number, number][] {
		let bezier = this.bezier_coordinates();
		let transform: (C: [number, number]) => [number, number];

		let aff : ((C:[number, number]) => [number, number]) = (C: [number, number]) => [this.cnf.tileSideLength * (this.vr + C[0]) + this.cnf.topLeft[0], this.cnf.tileSideLength*(this.vc + C[1]) + this.cnf.topLeft[1]];
		let rotate : ((C:[number, number]) => [number, number]) = (C: [number, number]) => [C[1], -C[0]];
		let step_r : ((C:[number, number]) => [number, number])  = (C: [number, number]) => [C[0] + this.cnf.tileSideLength, C[1]];
		let step_c : ((C:[number, number]) => [number, number]) = (C: [number, number]) => [C[0], C[1] + this.cnf.tileSideLength];
		let rc_to_xy : ((C:[number, number]) => [number, number]) = (C: [number, number]) => [C[1], C[0]];
 
		if(this.dir == "up") {
			transform = aff;
		}
		else if(this.dir == "right") {
			transform = (C: [number, number]) => aff(rotate(C));
		}
		else if(this.dir == "down") {
			transform = (C: [number, number]) => step_r(aff(C));
		}
		else if(this.dir == "left") {
			transform = (C: [number, number]) => step_c(rotate(aff(C)));
		}
		else {
			throw Error("Invalid this direction: " + this.dir);
		}
		return bezier.map( (C: [number, number]) => rc_to_xy(transform(C)) );
	}
}

export class PerimeterEdge extends PuzzleEdge {
	public bezier_coordinates(): [number, number][] {
		return [[0, 0], [0, 1]]
	}
}

export class LetterEdge extends PuzzleEdge {
	readonly letter: string;
	constructor(cnf: COORDINATES, vc: number, vr: number, dir: string, letter: string) {
		super(cnf, vc, vr, dir);
		this.letter = letter;
	}

	public bezier_coordinates(): [number, number][] {
		// someday, it should change per letter
		return [[0, 0], [0, 0.05], [0, 0.35], [0.3, 0.3], [0.4, 0.6], [0, 0.5], [0, 0.95], [0, 1]];
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