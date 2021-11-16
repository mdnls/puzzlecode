export class Grid {
	public Nc: number;
	public Nr: number;
	protected grid: string[][];
	constructor(Nr: number, Nc: number) {
		this.Nc = Nc;
		this.Nr = Nr;
		this.grid = Array(Nr);
		for(let i = 0; i < Nr; i++) {
			this.grid[i] = Array(Nc);
			this.grid[i].fill(" ");
		}	
	}
	public set(r: number, c: number, str: string) {
		this.grid[r][c] = str;
	}
	public get(r: number, c: number) {
		return this.grid[r][c];

	}
	public static from(grid: Grid) {
		let g = new Grid(grid.Nr, grid.Nc);
		g.grid = grid.grid.slice();
		return g; 
	}
}
export class TextGrid {
	protected text: string; 
	public width: number; 
	public height: number;
	public linewidth: number;
	protected lines: string[]; 
	protected grid: Grid;

	constructor(text: string, linewidth: number) {
		this.text = text;
		this.width = linewidth + 1; 
		this.linewidth = linewidth;

		let lines: string[] = [];
		for(let word of text.split(" ")) {
			if(lines.length > 1 && (word.length + lines[lines.length - 1].length + 1 < this.linewidth)) {
				lines[lines.length-1] = lines[lines.length - 1] + " " + word;
			}
			else {
				let fragment = word;
				while(fragment.length > this.linewidth) { 
					let head = fragment.slice(0, this.linewidth-1) + "-";
					lines.push(head);
					fragment = fragment.slice(this.linewidth-1);
				}
				lines.push(fragment);
			}
		}
		this.lines = lines;
		this.height = lines.length + 1;

		this.grid = new Grid(this.width, this.height);
		for(let i = 0; i < this.lines.length-1; i++) {
			for(let j = 0; j < this.lines[i].length; j++) {
				this.grid.set(i, j, this.lines[i][j]);
			}
		}
	}
	public get_lines() {
		return this.lines.slice()
	}
	public get_grid() {
		return Grid.from(this.grid);
	}
	public get(r: number, c: number) {
		return this.grid.get(r, c);
	}

}