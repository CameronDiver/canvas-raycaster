import { testMap } from './map';

export function setup(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext('2d');
	if (ctx == null) {
		throw new Error('Unable to setup rendering context');
	}
	// Make it fill the screen
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

export function start(
	canvas: HTMLCanvasElement,
	playerPos: { x: number; y: number },
	playerDir: { x: number; y: number },
	plane: { x: number; y: number },
) {
	console.log('Player pos: ', playerPos);
	console.log('Player dir: ', playerDir);
	console.log('Plane ', plane);
	// FIXME: Don't constantly get this
	const ctx = canvas.getContext('2d');
	if (ctx == null) {
		throw new Error('Unable to setup rendering context');
	}
	ctx.beginPath();
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'black';
	ctx.fill();

	let time = 0;
	let oldTime = 0;

	for (let screenX = 0; screenX < canvas.width; ++screenX) {
		// X coordinate in camera space
		const cameraX = (2 * screenX) / canvas.width - 1;
		const rayDir = {
			x: playerDir.x + plane.x * cameraX,
			y: playerDir.y + plane.y * cameraX,
		};

		let mapPos = { x: playerPos.x, y: playerPos.y };
		let sideDist: { x?: number; y?: number } = { x: undefined, y: undefined };

		// Length of ray from one x or y side to next x or y side
		const deltaDist = { x: Math.abs(1 / rayDir.x), y: Math.abs(1 / rayDir.y) };
		let perpWallDist: number;
		let stepX: number;
		let stepY: number;
		let hit = false; // Was a wall hit?
		let side: number; // Was a NS or EW wall hit?`

		//calculate step and initial sideDist
		if (rayDir.x < 0) {
			stepX = -1;
			sideDist.x = (playerPos.x - mapPos.x) * deltaDist.x;
		} else {
			stepX = 1;
			sideDist.x = (mapPos.x + 1.0 - playerPos.x) * deltaDist.x;
		}
		if (rayDir.y < 0) {
			stepY = -1;
			sideDist.y = (playerPos.y - mapPos.y) * deltaDist.y;
		} else {
			stepY = 1;
			sideDist.y = (mapPos.y + 1.0 - playerPos.y) * deltaDist.y;
		}

		//perform DDA
		while (!hit) {
			//jump to next map square, OR in x-direction, OR in y-direction
			if (sideDist.x < sideDist.y) {
				sideDist.x += deltaDist.x;
				mapPos.x += stepX;
				side = 0;
			} else {
				sideDist.y += deltaDist.y;
				mapPos.y += stepY;
				side = 1;
			}
			//Check if ray has hit a wall
			if (testMap[Math.floor(mapPos.x)][Math.floor(mapPos.y)] > 0) {
				hit = true;
			}
		}

		//Calculate distance projected on camera direction (Euclidean distance will give fisheye effect!)
		if (side! == 0) {
			perpWallDist = (mapPos.x - playerPos.x + (1 - stepX) / 2) / rayDir.x;
		} else {
			perpWallDist = (mapPos.y - playerPos.y + (1 - stepY) / 2) / rayDir.y;
		}
		// Calculate the height of the line to draw
		const lineHeight = Math.floor(canvas.height / perpWallDist);
		let drawStart = -lineHeight / 2 + canvas.height / 2;
		if (drawStart < 0) {
			drawStart = 0;
		}
		let drawEnd = lineHeight / 2 + canvas.height / 2;
		if (drawEnd >= canvas.height) {
			drawEnd = canvas.height - 1;
		}

		drawSlice(
			screenX,
			drawStart,
			drawEnd,
			testMap[Math.floor(mapPos.x)][Math.floor(mapPos.y)],
			ctx!,
		);
	}
}

function drawSlice(
	x: number,
	yStart: number,
	yEnd: number,
	mapTile: number,
	ctx: CanvasRenderingContext2D,
) {
	let colour: string;
	switch (mapTile) {
		case 1:
			colour = 'red';
			break;
		case 2:
			colour = 'blue';
			break;
		case 3:
			colour = 'yellow';
			break;
		case 4:
			colour = 'green';
			break;
		default:
			throw new Error(`Unrecognised tile type: ${mapTile}`);
	}

	ctx.beginPath();
	ctx.moveTo(x, yStart);
	ctx.lineTo(x, yEnd);
	ctx.strokeStyle = colour;
	ctx.stroke();
}
