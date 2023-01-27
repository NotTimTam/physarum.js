"use strict";

class Mathf {
	/**
	 * Converts an angle from radians to degrees.
	 * @param {number} radian - The radian value of an angle.
	 * @returns {number} Angle, converted to degrees.
	 */
	static radianToDegree(radian) {
		return radian * (180 / Math.PI);
	}

	/**
	 * Converts an angle from degrees to radians.
	 * @param {number} degree - The degree value of an angle.
	 * @returns {number} Angle, converted to radians.
	 */
	static degreeToRadian(degree) {
		return degree * (Math.PI / 180);
	}

	/**
	 * Creates a random integer between two values.
	 * @param {number} min - The minimum value.
	 * @param {number} max - The maximum value.
	 * @returns {number} - a random integer between two values.
	 */
	static range(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	/**
	 * Returns velocity per coordinate in two dimensions.
	 * @param {number} angle - The angle (in **degrees**) of rotation.
	 * @param {number} velocity - The velocity (in **pixels**) of motion at that angle.
	 * @returns {object} Returns the x and y coordinate result.
	 */
	static vectorToCartesian(angle, velocity) {
		return {
			x: velocity * Math.cos(Mathf.degreeToRadian(angle)),
			y: velocity * Math.sin(Mathf.degreeToRadian(angle)),
		};
	}

	/**
	 * Based on distance from [0, 0]
	 * @param {number} x - The x-coordinate to calculate with.
	 * @param {number} y - The y-coordinate to calculate with.
	 * @returns {Vector2} Returns the {Vector2} calculation.
	 */
	static cartesianToVector(x, y) {
		const vect = new Vector2(
			Mathf.radianToDegree(Math.atan2(y, x)),
			Math.sqrt(x ** 2 + y ** 2)
		);

		return vect;
	}

	/**
	 * Calculates the angle from one position to another.
	 * @param {number} object1_X - The x position to send the angle from.
	 * @param {number} object1_Y - The y position to send the angle from.
	 * @param {number} object2_X - The x position to send the angle to.
	 * @param {number} object2_Y - The y position to send the angle to.
	 * @returns {Angle} - The angle between the two points.
	 */
	static angleBetweenPoints(object1_X, object1_Y, object2_X, object2_Y) {
		return Mathf.radianToDegree(
			Math.atan2(object2_Y - object1_Y, object2_X - object1_X)
		);
	}

	/**
	 * Calculates the distance between two positions.
	 * @param {number} object1_X - The x position to send the angle from.
	 * @param {number} object1_Y - The y position to send the angle from.
	 * @param {number} object2_X - The x position to send the angle to.
	 * @param {number} object2_Y - The y position to send the angle to.
	 * @returns {number} - The distance between the two points.
	 */
	static distanceBetweenPoints(object1_X, object1_Y, object2_X, object2_Y) {
		return Math.sqrt(
			(object2_X - object1_X) ** 2 + (object2_Y - object1_Y) ** 2
		);
	}

	static posAroundCircle(
		circleRadius = 1,
		xPos,
		yPos,
		angleAroundCircle = 0
	) {
		const rad = Mathf.degreeToRadian(angleAroundCircle);

		return {
			x: circleRadius * Math.cos(rad) + xPos,
			y: circleRadius * Math.sin(rad) + yPos,
		};
	}
}

class Node {
	constructor(renderer, x, y) {
		this.rend = renderer;
		this.ctx = this.rend.ctx;

		// Rendering.
		this.x = x;
		this.y = y;
		this.size = 1;
		this.color = "white";

		this.lastPos = [x, y];

		this.maxVel = 100;
		this.angle = Math.random() * 360;
		this.velocity = this.maxVel;

		// Leading.
		this.lookPoints = [-45, 0, 45];
		this.attractionFactor = 1;
		this.lookDistance = this.size * 6;
	}

	input() {
		const { ctx, x, y, attractionFactor, lookPoints, lookDistance } = this;

		// console.log();
		let lookStrength = [0, 0, 0];

		for (let i = 0; i < lookPoints.length; i++) {
			const targetAngle = lookPoints[i];
			const newPos = Mathf.vectorToCartesian(
				this.angle + targetAngle,
				lookDistance
			);
			const pixelDataAtPos = rend.__get_color(
				this.x + newPos.x,
				this.y + newPos.y
			);

			// ctx.beginPath();
			// ctx.fillStyle = "red";
			// ctx.fillRect(this.x + newPos.x, this.y + newPos.y, 1, 1);
			// ctx.closePath();

			lookStrength[i] = {
				c: pixelDataAtPos[0] + pixelDataAtPos[1] + pixelDataAtPos[2],
				a: pixelDataAtPos[3],
			};
		}

		const [{ a: left }, { a: middle }, { a: right }] = lookStrength;

		let newDir = 0;
		if (left >= middle && right < left) {
			newDir = lookPoints[0] * attractionFactor;
		} else if (right >= middle && left < right) {
			newDir = lookPoints[2] * attractionFactor;
		} else if (left >= middle && right >= middle) {
			newDir =
				Mathf.range(lookPoints[0], lookPoints[2]) / attractionFactor;
		}

		this.rotate(newDir);
	}

	rotate(targetAngle, set = false) {
		if (set) this.angle = targetAngle;
		else this.angle += targetAngle;
		this.angle = (this.angle % 360) + 360;
	}

	logic() {
		const {
			velocity,
			maxVel,
			ctx: { canvas },
			rend: { deltaTime },
		} = this;

		// Don't go to fast.
		if (velocity > maxVel) this.velocity = maxVel;

		// Don't go out of bounds.
		if (this.x <= 0) {
			this.x = 0;

			this.rotate(180 - this.angle, true);
		}
		if (this.y <= 0) {
			this.y = 0;
			this.rotate(180 - this.angle, true);
		}
		if (this.x + this.size >= canvas.width) {
			this.x = canvas.width - this.size;
			this.rotate(180 - this.angle, true);
		}
		if (this.y + this.size >= canvas.height) {
			this.y = canvas.height - this.size;
			this.rotate(180 - this.angle, true);
		}

		if (rend.mouseDown) {
			this.rotate(
				Mathf.angleBetweenPoints(
					this.x,
					this.y,
					rend.mousePosition[0],
					rend.mousePosition[1]
				) + Mathf.range(-45, 45),
				true
			);

			this.velocity = this.maxVel * 4;
		}

		// Update position.
		const newPos = Mathf.vectorToCartesian(this.angle, this.velocity);
		this.x += newPos.x * deltaTime;
		this.y += newPos.y * deltaTime;
	}

	render() {
		const { ctx, x, y, size, color } = this;

		ctx.beginPath();

		ctx.fillStyle = color;
		ctx.strokeStyle = color;
		ctx.lineWidth = this.size * 2;
		ctx.moveTo(this.lastPos[0], this.lastPos[1]);
		ctx.lineTo(this.x, this.y);
		ctx.stroke();
		ctx.fillRect(x, y, size, size);

		ctx.closePath();

		this.lastPos = [this.x, this.y];
	}

	loop() {
		// Input
		this.input();

		// Logic
		this.logic();

		// Render
		this.render();
	}
}

class Renderer {
	constructor(targetResolution = window.innerWidth / 1.5, nodeCount = 1000) {
		this.canvas = document.querySelector("canvas#slime");
		if (!this.canvas) {
			this.canvas = document.createElement("canvas");
			this.canvas.id = "slime";

			document.body.appendChild(this.canvas);
		}
		this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
		this.ctx.imageSmoothingEnabled = false;

		// Framerate management.
		this.fps = 0;
		this.deltaTime = 0;
		this.__lastFpsCall = null;

		// Node management.
		this.nodes = [];

		// Render loop.
		this.loop = this.loop.bind(this);
		requestAnimationFrame(this.loop);

		// Rendering settings.
		this.diffusionSpeed = 4;
		const minRes = 400;
		const maxRes = 1920;
		this.resTarget = targetResolution;
		if (this.resTarget < minRes) this.resTarget = minRes;
		if (this.resTarget > maxRes) this.resTarget = maxRes;

		// Event bindings.
		this.__resize();
		window.addEventListener("resize", this.__resize);

		// Input.
		this.mouseDown = false;
		this.mousePosition = [0, 0];

		// Create nodes.
		for (let i = 0; i < nodeCount; i++) {
			this.__createNode();
		}

		window.addEventListener("mousedown", () => {
			this.mouseDown = true;
		});

		window.addEventListener("mouseup", () => {
			this.mouseDown = false;
		});

		window.addEventListener("mousemove", (e) => {
			const rect = this.canvas.getBoundingClientRect();
			this.mousePosition = [
				((e.clientX - rect.left) / (rect.right - rect.left)) *
					this.canvas.width,
				((e.clientY - rect.top) / (rect.bottom - rect.top)) *
					this.canvas.height,
			];
		});
	}

	__get_color = (x, y) => {
		const { ctx } = this;

		try {
			const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;

			return [r, g, b, a];
		} catch (err) {
			return [0, 0, 0, 0];
		}
	};

	__calculateFramerate = () => {
		// If there isn't a last call, we create one.
		if (!this.__lastFpsCall) {
			this.__lastFpsCall = performance.now();
			this.fps = 0;
			return;
		}

		// Calculate deltaTime.
		this.deltaTime = (performance.now() - this.__lastFpsCall) / 1000;

		// Set last call.
		this.__lastFpsCall = performance.now();

		// Calculate FPS.
		this.fps = 1 / this.deltaTime;
	};

	__resize = () => {
		const { canvas, resTarget } = this;

		this.canvas.width = resTarget;
		this.canvas.height =
			(canvas.clientHeight / canvas.clientWidth) * resTarget;
	};

	__clear = () => {
		const { ctx } = this;

		ctx.beginPath();

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	};

	__createNode = () => {
		this.nodes.push(
			new Node(
				this,
				Mathf.range(0, this.canvas.width),
				Mathf.range(0, this.canvas.height)
			)
		);
	};

	__darken = () => {
		const { ctx, diffusionSpeed } = this;

		ctx.beginPath();

		ctx.fillStyle = `rgba(0, 0, 0, ${diffusionSpeed / 100})`;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		ctx.closePath();
	};

	loop = () => {
		// Logic
		this.__calculateFramerate();

		// Render
		// this.__clear();
		for (const node of this.nodes) node.loop();
		this.__darken();

		requestAnimationFrame(this.loop);
	};
}

let [cells, resolution] = window.location.search.replace("?", "").split("&");
cells = +cells.split("=")[1];
resolution = resolution.split("=")[1];
resolution =
	resolution === "win"
		? window.innerWidth
		: resolution === "win2"
		? window.innerWidth / 1.5
		: 400;

const rend = new Renderer(resolution, cells < 3000 ? cells : 3000);
