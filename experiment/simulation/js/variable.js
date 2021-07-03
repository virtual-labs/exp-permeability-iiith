'use strict';

document.addEventListener('DOMContentLoaded', function() {

	const restartButton = document.getElementById('restart');
	const instrMsg = document.getElementById('procedure-message');

	restartButton.addEventListener('click', function() { restart(); });

	function randomNumber(min, max) {
		return (Math.random() * (max - min + 1) + min).toFixed(2);
	};

	function logic(tableData)
	{
		const soilData = { 'Silt': randomNumber(22.5, 27.5), 'Sand': randomNumber(12, 16), 'Clay': randomNumber(30, 50) };
		tableData.forEach(function(row, index) {
			const ans = (Number)(soilData[row['Soil Type']]);
			row['Water Content(%)'] = ans;
			row['Dry Soil Mass(g)'] = ((100 * wetSoilMass) / (ans + 100)).toFixed(2);
		});
	};

	function flow(obj, change, lim) {
		if(obj.waterHeight >= lim)
		{
			return 1;
		}

		obj.waterHeight += change;
		return 0;
	};

	class container {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.waterHeight = 0;
			this.img = new Image();
			this.img.src = './images/container.png';
			this.img.onload = () => { ctx.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height); };
		};

		draw(ctx) {
			ctx.fillStyle = "#1ca3ec";
			ctx.beginPath();
			ctx.rect(this.pos[0] + 5, this.pos[1] + this.height - 5, this.width - 10, -this.waterHeight);
			ctx.closePath();
			ctx.fill();

			ctx.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height);
		};
	};

	class soil {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.waterHeight = 0;
		};

		draw(ctx) {
			ctx.beginPath();
			ctx.fillStyle = "#654321";
			ctx.lineWidth = 0.001;
			ctx.beginPath();
			ctx.rect(this.pos[0], this.pos[1], this.width, this.height);
			ctx.closePath();
			ctx.fill();

			ctx.fillStyle = "#1ca3ec";
			ctx.globalAlpha = 0.3;
			ctx.beginPath();
			ctx.rect(this.pos[0], this.pos[1], this.width, this.waterHeight);
			ctx.closePath();
			ctx.fill();
			ctx.globalAlpha = 1;
		};
	};

	class mould {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.filter = false;
			this.waterStart = y + 0.4 * height;
			this.waterHeight = 0;
			this.outPercent = [0, 0];
		};

		draw(ctx) {
			const mouldWidth = 0.8 * this.width, mouldHeight = 0.6 * this.height, filterHeight = 0.15 * mouldHeight, pipeWidth = 0.05 * this.height; 
			ctx.lineWidth = 4;

			// Main mould
			ctx.fillStyle = "#A9A9A9";
			ctx.beginPath();
			ctx.rect(this.pos[0], this.pos[1] + this.height - mouldHeight + filterHeight, mouldWidth, mouldHeight - 2 * filterHeight);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// Green filters
			ctx.fillStyle = "#A4C652";
			if(this.filter)
			{
				ctx.beginPath();
				ctx.rect(this.pos[0], this.pos[1] + this.height - mouldHeight, mouldWidth, filterHeight);
				ctx.rect(this.pos[0], this.pos[1] + this.height - filterHeight, mouldWidth, filterHeight);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();

				ctx.beginPath();

				ctx.moveTo(this.pos[0] + mouldWidth / 2 - pipeWidth / 2, this.pos[1]);
				ctx.lineTo(this.pos[0] + mouldWidth / 2 - pipeWidth / 2, this.pos[1] + this.height - mouldHeight)
				ctx.moveTo(this.pos[0] + mouldWidth / 2 + pipeWidth / 2, this.pos[1]);
				ctx.lineTo(this.pos[0] + mouldWidth / 2 + pipeWidth / 2, this.pos[1] + this.height - mouldHeight)

				ctx.moveTo(this.pos[0] + mouldWidth, this.pos[1] + this.height);
				ctx.lineTo(this.pos[0] + this.width, this.pos[1] + this.height)
				ctx.moveTo(this.pos[0] + mouldWidth, this.pos[1] + this.height - pipeWidth);
				ctx.lineTo(this.pos[0] + this.width, this.pos[1] + this.height - pipeWidth)
				ctx.stroke();
			}
	
			ctx.fillStyle = "#1ca3ec";
			ctx.globalAlpha = 0.3;
			ctx.beginPath();

			if(this.waterHeight > 0)
			{
				ctx.rect(this.pos[0] + mouldWidth / 2 - pipeWidth / 2, this.waterStart, pipeWidth, this.waterHeight);
				if(this.waterStart + this.waterHeight >= this.pos[1] + this.height - mouldHeight)
				{
					ctx.rect(this.pos[0], this.pos[1] + this.height - mouldHeight, mouldWidth, this.waterStart + this.waterHeight - (this.pos[1] + this.height - mouldHeight));
					ctx.fill();
					ctx.closePath();
					ctx.globalAlpha = 1;
					ctx.beginPath();

					if(this.waterStart + this.waterHeight >= this.pos[1] + this.height)
					{
						const radius = 8, outHeight = 40;
						ctx.rect(this.pos[0] + mouldWidth, this.pos[1] + this.height - pipeWidth, this.outPercent[0] * (this.width - mouldWidth), pipeWidth);
						if(this.outPercent[0] >= 1)
						{
							ctx.moveTo(this.pos[0] + mouldWidth, this.pos[1] + this.height - pipeWidth);
							ctx.arcTo(this.pos[0] + this.width + pipeWidth, this.pos[1] + this.height - pipeWidth, this.pos[0] + this.width + pipeWidth, this.pos[1] + this.height + this.outPercent[1] * outHeight, radius);
							ctx.lineTo(this.pos[0] + this.width + pipeWidth, this.pos[1] + this.height + this.outPercent[1] * outHeight);
							ctx.lineTo(this.pos[0] + this.width, this.pos[1] + this.height + this.outPercent[1] * outHeight);
							ctx.arcTo(this.pos[0] + this.width, this.pos[1] + this.height, this.pos[0] + mouldWidth, this.pos[1] + this.height, radius);
							ctx.lineTo(this.pos[0] + mouldWidth, this.pos[1] + this.height);
							ctx.lineTo(this.pos[0] + mouldWidth, this.pos[1] + this.height - pipeWidth);

							if(this.outPercent[1] < 1)
							{
								this.outPercent[1] += 0.05;
							}
						}

						else
						{
							this.outPercent[0] += 0.05;
						}
					}
				}
			}

			ctx.closePath();
			ctx.fill();
			ctx.globalAlpha = 1;
		};

		fill(change) {
			if(this.waterHeight >= 0.85 * 0.4 * this.height)
			{
				return 1;
			}

			this.waterStart -= change;
			this.waterHeight += change;
			return 0;
		};
	};

	class tank {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.waterHeight = 2 * height / 3;
		};

		draw(ctx) {
			ctx.lineWidth = 4;
			ctx.fillStyle = "#1ca3ec";
			ctx.beginPath();
			ctx.rect(this.pos[0], this.pos[1] + (this.height - this.waterHeight), this.width, this.waterHeight);
			ctx.closePath();
			ctx.fill();

			ctx.beginPath();
			ctx.moveTo(this.pos[0], this.pos[1]);
			ctx.lineTo(this.pos[0], this.pos[1] + this.height);
			ctx.lineTo(this.pos[0] + this.width, this.pos[1] + this.height);
			ctx.lineTo(this.pos[0] + this.width, this.pos[1]);
			ctx.stroke();
		};
	};

	function init()
	{
		document.getElementById("output1").innerHTML = "Mass of container = ___ g";
		document.getElementById("output2").innerHTML = "Mass of wet soil = ___ g";

		objs = {
			"mould": new mould(240, 180, 90, 100),
			"filters": '',
			"water": '',
			"soil": new soil(95, 140, 92, 220),
			"tank": new tank(45, 180, 70, 70),
			"container": new container(50, 75, 250, 350),
		};
		keys = [];

		enabled = [["mould"], ["mould", "soil"], ["mould", "soil", "filters"], ["mould", "soil", "water"], ["mould", "soil", "container"], ["mould", "soil", "container"], ["container", "soil", "water"], ["container", "soil", "water"], []];
		step = 0;
		translate = [0, 0];
		lim = [-1, -1];
	};

	function restart() 
	{ 
		window.clearTimeout(tmHandle); 

		document.getElementById("apparatus").style.display = 'block';
		document.getElementById("observations").style.width = '';

		table.innerHTML = "";
		init();

		tmHandle = window.setTimeout(draw, 1000 / fps); 
	};

	function generateTableHead(table, data) {
		const thead = table.createTHead();
		const row = thead.insertRow();
		data.forEach(function(key, ind) {
			const th = document.createElement("th");
			const text = document.createTextNode(key);
			th.appendChild(text);
			row.appendChild(th);
		});
	};

	function generateTable(table, data) {
		data.forEach(function(rowVals, ind) {
			const row = table.insertRow();
			Object.keys(rowVals).forEach(function(key, i) {
				const cell = row.insertCell();
				const text = document.createTextNode(rowVals[key]);
				cell.appendChild(text);
			});
		});
	};

	function check(event, translate, step, flag=true)
	{ 
		if(translate[0] !== 0 || translate[1] !== 0)
		{
			return;
		}

		const canvasPos = [(canvas.width / canvas.offsetWidth) * (event.pageX - canvas.offsetLeft), (canvas.height / canvas.offsetHeight) * (event.pageY - canvas.offsetTop)];
		const errMargin = 10;

		let hover = false;
		canvas.style.cursor = "default";
		keys.forEach(function(val, ind) {
			if(canvasPos[0] >= objs[val].pos[0] - errMargin && canvasPos[0] <= objs[val].pos[0] + objs[val].width + errMargin && canvasPos[1] >= objs[val].pos[1] - errMargin && canvasPos[1] <= objs[val].pos[1] + objs[val].height + errMargin)
			{
				if(step === 5 && val === "mould")
				{
					hover = true;
					translate[1] = 0.5;
				}

				else if(step === 6 && val === "container")
				{
					hover = true;
					translate[0] = 5;
					translate[1] = 5;
					lim[0] = 560;
					lim[1] = 150;
				}

				else if(step === 7 && val === "water" && canvasPos[0] >= objs[val].pos[0] - errMargin && canvasPos[0] <= objs[val].pos[0] + objs[val].width + errMargin && canvasPos[1] >= objs[val].pos[1] + objs[val].height * 0.8 - errMargin && canvasPos[1] <= objs[val].pos[1] + objs[val].height + errMargin)
				{
					hover = true;
					translate[1] = 1;
					lim[1] = 210;
				}

				else if(step === 8 && val === "container")
				{
					hover = true;
					translate[0] = -5;
					translate[1] = -5;
					lim[0] = 135;
					lim[1] = 110;
				}
			}
		});

		if(!flag && hover)
		{
			canvas.style.cursor = "pointer";
			translate[0] = 0;
			translate[1] = 0;
			lim[0] = 0;
			lim[1] = 0;
		}
	};

	function curvedArea(ctx, e, gradX, gradY)
	{
		ctx.bezierCurveTo(e[0], e[1] += gradY, e[0] += gradX, e[1] += gradY, e[0] += gradX, e[1]);
		ctx.bezierCurveTo(e[0] += gradX, e[1], e[0] += gradX, e[1] -= gradY, e[0], e[1] -= gradY);
	};

	const canvas = document.getElementById("main");
	canvas.width = 840;
	canvas.height = 400;
	canvas.style = "border:3px solid";
	const ctx = canvas.getContext("2d");

	const fill = "#A9A9A9", border = "black", lineWidth = 1.5, fps = 150;
	const msgs = [
		"Click on 'Constant Head Permeameter' in the apparatus menu to add a mould to the workspace.", 
		"Click on 'Container' in the apparatus menu to add a container to the workspace.",
		"Click on the container to move it to the weighing machine and weigh it.",
		"Click on 'Soil Sample' in the apparatus menu, set appropriate input values (Soil Mass) and click 'Add' to add a soil sample to the workspace.",
		"Click on the soil sample to add it to the container and weigh it.",
		"Click on 'Water Supply' in the apparatus menu to add an water to the workspace.", 
		"Click on the container to move it to the water.",
		"Click on the water red portion to start the water and heat the soil.",
		"Click on the container with dry soil to weigh it.",
		"Click the restart button to perform the experiment again.",
	];

	let step, translate, lim, objs, keys, enabled, small;
	init();

	const tableData = [
		{ "Soil Type": "Silt", "Dry Soil Mass(g)": "", "Water Content(%)": "" },
		{ "Soil Type": "Sand", "Dry Soil Mass(g)": "", "Water Content(%)": "" },
		{ "Soil Type": "Clay", "Dry Soil Mass(g)": "", "Water Content(%)": "" },
	];

	const objNames = Object.keys(objs);
	objNames.forEach(function(elem, ind) {
		const obj = document.getElementById(elem);
		obj.addEventListener('click', function(event) {
			if(elem === "filters")
			{
				objs['mould'].filter = true;
				step += 1;
				return;
			}

			else if(elem === "water")
			{
				translate[1] = 0.5;
				return;
			}

			keys.push(elem);
			step += 1;
		});
	});

	canvas.addEventListener('mousemove', function(event) {check(event, translate, step, false);});
	canvas.addEventListener('click', function(event) {check(event, translate, step);});

	function responsiveTable(x) {
		if(x.matches)	// If media query matches
		{ 
			small = true;
			if(step === enabled.length - 1)
			{
				document.getElementById("observations").style.width = '85%';
			}
		} 

		else
		{
			small = false;
			if(step === enabled.length - 1)
			{
				document.getElementById("observations").style.width = '40%';
			}
		}
	};

	let x = window.matchMedia("(max-width: 1023px)");
	responsiveTable(x); // Call listener function at run time
	x.addListener(responsiveTable); // Attach listener function on state changes

	function draw()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height); 
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		let ctr = 0;
		document.getElementById("main").style.pointerEvents = 'none';

		objNames.forEach(function(name, ind) {
			document.getElementById(name).style.pointerEvents = 'auto';
			if(keys.includes(name) || !(enabled[step].includes(name)))
			{
				document.getElementById(name).style.pointerEvents = 'none';
			}

			if(keys.includes(name)) 
			{
				if(enabled[step].includes(name))
				{
					ctr += 1;
				}
				objs[name].draw(ctx);
			}
		});

		if(ctr === enabled[step].length)
		{
			document.getElementById("main").style.pointerEvents = 'auto';
		}

		if(translate[0] !== 0 || translate[1] !== 0)
		{
			let temp = step;
			if(step === 3)
			{
				temp += objs['mould'].fill(translate[1]);
			}

			if(step === 5)
			{
				flow(objs['mould'], translate[1], objs['mould'].height);

				if(objs['mould'].pos[1] + objs['mould'].waterHeight >= objs['soil'].pos[1])
				{
					flow(objs['soil'], translate[1], objs['soil'].height);
				}

				if(objs['mould'].outPercent[1] >= 1)
				{
					temp += flow(objs['container'], translate[1], objs['container'].height - 15);
				}
			}

			if(temp != step)
			{
				translate[1] = 0;
			}
			step = temp;
		}

		document.getElementById("procedure-message").innerHTML = msgs[step];
		tmHandle = window.setTimeout(draw, 1000 / fps);
	};

	let tmHandle = window.setTimeout(draw, 1000 / fps);
});
