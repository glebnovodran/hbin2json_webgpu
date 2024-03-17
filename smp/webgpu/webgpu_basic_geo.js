function main() {
	console.clear();
	scene.init("canvas", "webgpu");
	scene.load([
		"basic.json"
	], start);
}