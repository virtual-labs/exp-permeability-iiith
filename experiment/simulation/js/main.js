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

	class permeameter {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.filter = false;
			this.waterHeight = 0;
			this.upPipePercent = [0, 0];
			this.downPipePercent = [0, 0];
			this.outPercent = [0, 0];
		};

		draw(ctx) {
			const mouldWidth = 0.6 * this.width, mouldHeight = 0.8 * this.height, filterHeight = 0.15 * mouldHeight, filPipeLen = 0.3 * (this.height - mouldHeight), pipeWidth = 0.05 * this.height, gap = 0.05 * this.height, pipesMargin = 0.2 * (this.width - mouldWidth);
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

				ctx.moveTo(this.pos[0] + mouldWidth / 2 - pipeWidth / 2, this.pos[1] + filPipeLen);
				ctx.lineTo(this.pos[0] + mouldWidth / 2 - pipeWidth / 2, this.pos[1] + this.height - mouldHeight)
				ctx.moveTo(this.pos[0] + mouldWidth / 2 + pipeWidth / 2, this.pos[1] + filPipeLen);
				ctx.lineTo(this.pos[0] + mouldWidth / 2 + pipeWidth / 2, this.pos[1] + this.height - mouldHeight)

				ctx.moveTo(this.pos[0] + mouldWidth, this.pos[1] + this.height);
				ctx.lineTo(this.pos[0] + mouldWidth + 840 * filPipeLen / 400, this.pos[1] + this.height)
				ctx.moveTo(this.pos[0] + mouldWidth, this.pos[1] + this.height - pipeWidth);
				ctx.lineTo(this.pos[0] + mouldWidth + 840 * filPipeLen / 400, this.pos[1] + this.height - pipeWidth)
				ctx.stroke();
			}
	
			ctx.fillStyle = "white";
			ctx.beginPath();

			ctx.moveTo(this.pos[0] + mouldWidth, this.pos[1] + this.height - filterHeight - gap);
			ctx.lineTo(this.pos[0] + this.width, this.pos[1] + this.height - filterHeight - gap);
			ctx.lineTo(this.pos[0] + this.width, this.pos[1] + this.height - filterHeight - (this.height - mouldHeight + filterHeight + pipeWidth + gap)); 

			ctx.moveTo(this.pos[0] + mouldWidth, this.pos[1] + this.height - filterHeight - gap - pipeWidth);
			ctx.lineTo(this.pos[0] + this.width - pipeWidth, this.pos[1] + this.height - filterHeight - gap - pipeWidth);
			ctx.lineTo(this.pos[0] + this.width - pipeWidth, this.pos[1] + this.height - filterHeight - (this.height - mouldHeight + filterHeight + pipeWidth + gap));

			ctx.moveTo(this.pos[0] + mouldWidth, this.pos[1] + this.height - mouldHeight + filterHeight + pipeWidth + gap);
			ctx.lineTo(this.pos[0] + this.width - pipeWidth - pipesMargin, this.pos[1] + this.height - mouldHeight + filterHeight + pipeWidth + gap);
			ctx.lineTo(this.pos[0] + this.width - pipeWidth - pipesMargin, this.pos[1]);

			ctx.moveTo(this.pos[0] + mouldWidth, this.pos[1] + this.height - mouldHeight + filterHeight + gap);
			ctx.lineTo(this.pos[0] + this.width - 2 * pipeWidth - pipesMargin, this.pos[1] + this.height - mouldHeight + filterHeight + gap);
			ctx.lineTo(this.pos[0] + this.width - 2 * pipeWidth - pipesMargin, this.pos[1]);
			ctx.stroke();

			ctx.fillStyle = "#1ca3ec";
			ctx.beginPath();

			if(this.waterHeight >= filPipeLen)
			{
				if(this.waterHeight >= this.height - mouldHeight)
				{
					ctx.rect(this.pos[0] + mouldWidth / 2 - pipeWidth / 2 + 2, this.pos[1] + filPipeLen, pipeWidth - 4, this.height - mouldHeight - filPipeLen);

					ctx.closePath();
					ctx.fill();
					ctx.globalAlpha = 0.3;
					ctx.beginPath();

					ctx.rect(this.pos[0], this.pos[1] + this.height - mouldHeight, mouldWidth, this.waterHeight - (this.height - mouldHeight));
					ctx.fill();
					ctx.closePath();
					ctx.globalAlpha = 1;
					ctx.beginPath();

					if(this.waterHeight >= this.height - mouldHeight + filterHeight + gap)
					{
						ctx.rect(this.pos[0] + mouldWidth, this.pos[1] + this.height - mouldHeight + filterHeight + gap, this.upPipePercent[0] * (this.width - mouldWidth - pipeWidth - pipesMargin), pipeWidth);
						ctx.rect(this.pos[0] + this.width - 2 * pipeWidth - pipesMargin, this.pos[1] + this.height - mouldHeight + filterHeight + gap, pipeWidth, -this.upPipePercent[1] * (this.height - mouldHeight + filterHeight + gap));

						if(this.upPipePercent[0] >= 1)
						{
							this.upPipePercent[0] = 1;
							if(this.upPipePercent[1] < 0.7)
							{
								this.upPipePercent[1] += 0.03;
							}
						}

						else
						{
							this.upPipePercent[0] += 0.03;
						}

						if(this.waterHeight >= this.height - filterHeight - gap - pipeWidth)
						{
							ctx.rect(this.pos[0] + mouldWidth, this.pos[1] + this.height - filterHeight - gap - pipeWidth, this.downPipePercent[0] * (this.width - mouldWidth), pipeWidth);
							ctx.rect(this.pos[0] + this.width - pipeWidth, this.pos[1] + this.height - filterHeight - gap - pipeWidth, pipeWidth, -this.downPipePercent[1] * (this.height - mouldHeight + filterHeight + pipeWidth));

							if(this.downPipePercent[0] >= 1)
							{
								this.downPipePercent[0] = 1;
								if(this.downPipePercent[1] < 0.4)
								{
									this.downPipePercent[1] += 0.03;
								}
							}

							else
							{
								this.downPipePercent[0] += 0.03;
							}

							if(this.waterHeight >= this.height)
							{
								const radius = 8, outHeight = 55;
								ctx.rect(this.pos[0] + mouldWidth, this.pos[1] + this.height - pipeWidth, this.outPercent[0] * (840 * filPipeLen / 400), pipeWidth);
								if(this.outPercent[0] >= 1)
								{
									ctx.moveTo(this.pos[0] + mouldWidth, this.pos[1] + this.height - pipeWidth);
									ctx.arcTo(this.pos[0] + mouldWidth + (840 * filPipeLen / 400) + pipeWidth, this.pos[1] + this.height - pipeWidth, this.pos[0] + mouldWidth + (840 * filPipeLen / 400) + pipeWidth, this.pos[1] + this.height + this.outPercent[1] * outHeight, radius);
									ctx.lineTo(this.pos[0] + mouldWidth + (840 * filPipeLen / 400) + pipeWidth, this.pos[1] + this.height + this.outPercent[1] * outHeight);
									ctx.lineTo(this.pos[0] + mouldWidth + (840 * filPipeLen / 400), this.pos[1] + this.height + this.outPercent[1] * outHeight);
									ctx.arcTo(this.pos[0] + mouldWidth + (840 * filPipeLen / 400), this.pos[1] + this.height, this.pos[0] + mouldWidth, this.pos[1] + this.height, radius);
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
				}

				else
				{
					ctx.rect(this.pos[0] + mouldWidth / 2 - pipeWidth / 2 + 2, this.pos[1] + filPipeLen, pipeWidth - 4, this.waterHeight - filPipeLen);
				}
			}

			ctx.closePath();
			ctx.fill();
			ctx.globalAlpha = 1;
		};
	};

	class reservoir {
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

	class tap {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.img = new Image();
			this.img.src = './images/tap.png';
			this.img.onload = () => { ctx.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height); };
		};

		draw(ctx) {
			ctx.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height);
		};
	};

	class supply {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.waterHeight = 0;
			this.reservoir = new reservoir(height, width, x, y);
			this.tap = new tap(50, 120, 0, 0);
		};

		draw(ctx) {
			this.reservoir.draw(ctx);
			this.tap.draw(ctx);
			const waterWidth = 8;

			ctx.fillStyle = "#1ca3ec";
			ctx.globalAlpha = 0.3;
			ctx.beginPath();
			ctx.rect(this.tap.width - waterWidth / 2 - 7.5, this.tap.height - 7.5, waterWidth, this.waterHeight);
			ctx.closePath();
			ctx.fill();
			ctx.globalAlpha = 1;
		};
	};

	function init()
	{
		document.getElementById("output1").innerHTML = "Mass of container = ___ g";
		document.getElementById("output2").innerHTML = "Mass of wet soil = ___ g";

		objs = {
			"permeameter": new permeameter(240, 240, 90, 100),
			"filters": '',
			"soil": new soil(135, 140, 92, 175),
			"water": new supply(45, 180, 70, 70),
			"container": new container(50, 75, 250, 350),
		};
		keys = [];

		enabled = [["permeameter"], ["permeameter", "soil"], ["permeameter", "soil", "filters"], ["permeameter", "soil", "water"], ["permeameter", "soil", "water", "container"], ["permeameter", "soil", "water"], ["container", "soil", "water"], ["container", "soil", "water"], []];
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
				if(step === 5 && val === "water")
				{
					hover = true;
					translate[1] = 0.5;
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

	const canvas = document.getElementById("main");
	canvas.width = 840;
	canvas.height = 400;
	canvas.style = "border:3px solid";
	const ctx = canvas.getContext("2d");

	const fill = "#A9A9A9", border = "black", lineWidth = 1.5, fps = 150;
	const msgs = [
		"Click on 'Constant Head Permeameter' in the apparatus menu to add a permeameter to the workspace.", 
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
				objs['permeameter'].filter = true;
				step += 1;
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
			if(step === 5)
			{
				flow(objs['water'], translate[1], 50);
				flow(objs['permeameter'], translate[1], objs['permeameter'].height);

				if(objs['permeameter'].pos[1] + objs['permeameter'].waterHeight >= objs['soil'].pos[1])
				{
					flow(objs['soil'], translate[1], objs['soil'].height);
				}

				if(objs['permeameter'].outPercent[1] >= 1)
				{
					temp += flow(objs['container'], translate[1], objs['container'].height - 15);
				}

				if(temp != step)
				{
					translate[1] = 0;
				}
			}

			step = temp;
		}

		document.getElementById("procedure-message").innerHTML = msgs[step];
		tmHandle = window.setTimeout(draw, 1000 / fps);
	};

	let tmHandle = window.setTimeout(draw, 1000 / fps);
});
