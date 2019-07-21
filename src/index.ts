import * as raycaster from './raycaster';
import { testMap } from './map';

window.onerror = (event, source, lineno) => {
	console.log('==================================================');
	console.log('ERROR: ', event);
	console.log(`at ${source}:${lineno}`);
	console.log('==================================================');
};

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
raycaster.setup(canvas);

const playerPos = { x: 20, y: 10 };
const playerDir = { x: -1, y: 0 };
const plane = { x: 0, y: 0.66 };
const moveSpeed = 1;
const rotateSpeed = 0.1;

raycaster.start(canvas, playerPos, playerDir, plane);

const keysDown = {
	up: false,
	down: false,
	left: false,
	right: false,
};
document.addEventListener('keydown', ev => {
	switch (ev.keyCode) {
		// Left
		case 37:
			keysDown.left = true;
			break;
		// Right
		case 39:
			keysDown.right = true;
			break;
		// Up
		case 38:
			keysDown.up = true;
			break;
		// Down
		case 40:
			keysDown.down = true;
			break;
	}
});

document.addEventListener('keyup', ev => {
	switch (ev.keyCode) {
		// Left
		case 37:
			keysDown.left = false;
			break;
		// Right
		case 39:
			keysDown.right = false;
			break;
		// Up
		case 38:
			keysDown.up = false;
			break;
		// Down
		case 40:
			keysDown.down = false;
			break;
	}
});

setInterval(() => {
	// Move forwards if there isn't a wall
	if (keysDown.up) {
		if (
			testMap[Math.floor(playerPos.x + playerDir.x * moveSpeed)][
				Math.floor(playerPos.y)
			] === 0
		) {
			playerPos.x += playerDir.x * moveSpeed;
		}
		if (
			testMap[Math.floor(playerPos.x)][
				Math.floor(playerPos.y + playerDir.y * moveSpeed)
			] === 0
		) {
			playerPos.y += playerDir.y * moveSpeed;
		}
	}

	//move backwards if no wall behind you
	if (keysDown.down) {
		if (
			testMap[Math.floor(playerPos.x - playerDir.x * moveSpeed)][
				Math.floor(playerPos.y)
			] === 0
		) {
			playerPos.x -= playerDir.x * moveSpeed;
		}
		if (
			testMap[Math.floor(playerPos.x)][
				Math.floor(playerPos.y - playerDir.y * moveSpeed)
			] === 0
		) {
			playerPos.y -= playerDir.y * moveSpeed;
		}
	}

	//rotate to the right
	if (keysDown.right) {
		//both camera direction and camera plane must be rotated
		const oldDirX = playerDir.x;
		playerDir.x =
			playerDir.x * Math.cos(-rotateSpeed) -
			playerDir.y * Math.sin(-rotateSpeed);
		playerDir.y =
			oldDirX * Math.sin(-rotateSpeed) + playerDir.y * Math.cos(-rotateSpeed);
		const oldPlaneX = plane.x;
		plane.x =
			plane.x * Math.cos(-rotateSpeed) - plane.y * Math.sin(-rotateSpeed);
		plane.y =
			oldPlaneX * Math.sin(-rotateSpeed) + plane.y * Math.cos(-rotateSpeed);
	}
	//rotate to the left
	if (keysDown.left) {
		//both camera direction and camera plane must be rotated
		const oldDirX = playerDir.x;
		playerDir.x =
			playerDir.x * Math.cos(rotateSpeed) - playerDir.y * Math.sin(rotateSpeed);
		playerDir.y =
			oldDirX * Math.sin(rotateSpeed) + playerDir.y * Math.cos(rotateSpeed);
		const oldPlaneX = plane.x;
		plane.x = plane.x * Math.cos(rotateSpeed) - plane.y * Math.sin(rotateSpeed);
		plane.y =
			oldPlaneX * Math.sin(rotateSpeed) + plane.y * Math.cos(rotateSpeed);
	}

	raycaster.start(canvas, playerPos, playerDir, plane);
}, 100);
