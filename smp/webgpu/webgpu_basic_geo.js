class GPUWk {

}

g_wk = new GPUWk();

async function initGPU() {
	console.info("initGPU...");
}

function createModel(json) {
}

function update() {
	const cam = scene.cam;
	cam.eye.set(0.0, 0.2, 1.0);
	cam.tgt.set(0.0, 0.25, 0.0);
	cam.update();
	g_mdlMtx = mdegy(g_y_degrees);
	g_y_degrees -= 0.5;
}

function loop() {
	update();
	requestAnimationFrame(loop);
}

async function start() {
	scene.printFiles();
	await initGPU();

	let mdlSrc = scene.files["basic.json"];
	if (mdlSrc) {
		let mdlJson = JSON.parse(mdlSrc);
		if (mdlJson.dataType == "geo") {
			g_mdlData = mdlJson;
			createModel(mdlJson);
		}
	}

	requestAnimationFrame(loop);
}


function main() {
	console.clear();
	scene.init("canvas", "webgpu");
	scene.load([
		"basic_vert.wgsl",
		"basic_frag.wgsl",
		"basic.json"
	], start);
}