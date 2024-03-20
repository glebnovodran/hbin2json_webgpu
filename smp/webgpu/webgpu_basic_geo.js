let g_vtxBuf = null;
let g_idxBuf = null;

let g_renderPipeline = null;
let g_device = null;

let g_uniformBuf = null;
let g_uniformBindGrp = null;

let g_npnt = 0;
let g_nvtx = 0;
let g_y_degrees = 0.0;
let g_mdlMtx = null;

let g_depthTexture = null;

const g_vtxBuffersDesc = [
	{
		attributes: [
			{
				shaderLocation: 0, // vtxPos
				offset: 0,
				format: "float32x3",
			},
			{
				shaderLocation: 1, // vtxClr
				offset: 12,
				format: "float32x3",
			},
		],
		arrayStride: 24,
		stepMode: "vertex",
	}
];

const g_renderPassDesc = {
	colorAttachments: [
		{
			clearValue: { r: 0.11, g: 0.22, b: 0.27, a: 1.0 },
			loadOp: "clear",
			storeOp: "store",
			view: undefined,
		}
	],

	depthStencilAttachment: {
		depthClearValue: 1.0,
		depthLoadOp: "clear",
		depthStoreOp: "store",
		view: undefined,
	},
};

async function initGPU() {
	console.info("initGPU...");

	if (!navigator.gpu) {
		throw Error("WebGPU not supported.");
	}

	let wgpuCtx = scene.wgpu;
	if (!wgpuCtx) {
		throw Error("No WebGPU context obtained.");
	}

	const wgpuAdapter = await navigator.gpu.requestAdapter();
	if (!wgpuAdapter) {
		throw Error("Can't request WebGPU adapter.");
	}

	g_device = await wgpuAdapter.requestDevice();

	let vertSrc = scene.files["basic_vert.wgsl"];
	const vertShaderModule = g_device.createShaderModule({
		code : vertSrc,
	});

	let fragSrc = scene.files["basic_frag.wgsl"];
	const fragShaderModule = g_device.createShaderModule({
		code : fragSrc,
	});

	wgpuCtx.configure({
		device : g_device,
		format : navigator.gpu.getPreferredCanvasFormat(),
		alphaMode: "premultiplied",
	});

	const wgpuPipelineDesc = {
		vertex: {
			module: vertShaderModule,
			entryPoint: "main",
			buffers: g_vtxBuffersDesc,
		},
		fragment: {
			module: fragShaderModule,
			entryPoint: "main",
			targets: [
				{
					format: navigator.gpu.getPreferredCanvasFormat(),
				},
			],
		},
		primitive: {
			topology: "triangle-list",
			//cullMode: 'back',
			frontFace: "ccw",
		},
		depthStencil: {
			depthCompare: "less-equal",
			depthWriteEnabled: true,
			format:"depth32float",
		},
		layout: "auto",
	};

	g_renderPipeline = g_device.createRenderPipeline(wgpuPipelineDesc);

	const bufSz = 4*16 + 4*16;
	g_uniformBuf = g_device.createBuffer({
		size: bufSz,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});

	g_uniformBindGrp = g_device.createBindGroup({
		layout: g_renderPipeline.getBindGroupLayout(0),
		entries: [
			{
				binding: 0,
				resource: {
					buffer: g_uniformBuf,
					offset: 0,
					size: bufSz,
				},
			},
		],
	});
	const cam = scene.cam;
	g_depthTexture = g_device.createTexture({
		size: [cam.width, cam.height],
		format: "depth32float",
		usage: GPUTextureUsage.RENDER_ATTACHMENT,
	});

	console.info("OK");
}

function createModel(json) {
	let ntri = json.ntri;
	if (ntri < 1) return;

	g_npnt = json.npnt;
	const floatsPerVertex = 3 * 2; // (pos + color) per vertex
	let vbSize = g_npnt * floatsPerVertex;
	let clrIdx = -1;
	for (let i = 0; i < json.npntVecAttrs; ++i) {
		if (json.pntVecAttrNames[i] == "Cd") {
			clrIdx = i;
			break;
		}
	}
	const clrSrc = clrIdx*g_npnt*3;
	const vbData = new Float32Array(vbSize);
	for (let i = 0; i < g_npnt; ++i) {
		const srcIdx = i * 3;
		const vbIdx = i * floatsPerVertex;
		for (let j = 0; j < 3; ++j) {
			vbData[vbIdx + j] = json.pnts[srcIdx + j];
		}
		if (clrIdx < 0) {
			for (let j = 0; j < 3; ++j) {
				vbData[vbIdx + 3 + j] = 1.0;
			}
		} else {
			const pntClrSrc = clrSrc + i*3;
			for (let j = 0; j < 3; ++j) {
				vbData[vbIdx + 3 + j] = json.pntsVecData[pntClrSrc + j];
			}
		}
	}

	g_nvtx = ntri * 3;
	const ibData = new Uint32Array(g_nvtx);
	for (let i = 0; i < g_nvtx; ++i) {
		ibData[i] = json.triIdx[i];
	}

	g_vtxBuf = g_device.createBuffer({
		size: vbData.byteLength,
		usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
	});

	if (!g_vtxBuf) return;

	g_device.queue.writeBuffer(g_vtxBuf, 0, vbData, 0);

	g_idxBuf = g_device.createBuffer({
		size: ibData.byteLength,
		usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
	});

	if (!g_idxBuf) return;

	g_device.queue.writeBuffer(g_idxBuf, 0, ibData, 0);
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
	let wgpuCtx = scene.wgpu;
	if (!wgpuCtx) return;
	if (!g_device) return;

	update();
	const cam = scene.cam;
	const mtxSz = g_mdlMtx.e.byteLength;
	g_device.queue.writeBuffer(g_uniformBuf, 0, g_mdlMtx.e.buffer, g_mdlMtx.e.byteOffset, mtxSz);
	g_device.queue.writeBuffer(g_uniformBuf, 64, cam.viewProj.e.buffer, cam.viewProj.e.byteOffset, 64);

	const wgpuCmdEncoder = g_device.createCommandEncoder();
	const wgpuTexView = wgpuCtx.getCurrentTexture().createView();
	g_renderPassDesc.colorAttachments[0].view = wgpuTexView;
	g_renderPassDesc.depthStencilAttachment.view = g_depthTexture.createView();

	const wgpuPassEncoder = wgpuCmdEncoder.beginRenderPass(g_renderPassDesc);

	wgpuPassEncoder.setPipeline(g_renderPipeline);
	wgpuPassEncoder.setVertexBuffer(0, g_vtxBuf);
	wgpuPassEncoder.setIndexBuffer(g_idxBuf, 'uint32');
	wgpuPassEncoder.setBindGroup(0, g_uniformBindGrp);
	wgpuPassEncoder.drawIndexed(g_nvtx);

	wgpuPassEncoder.end();
	g_device.queue.submit([wgpuCmdEncoder.finish()]);

	requestAnimationFrame(loop);
}

async function start() {
	scene.printFiles();
	try {
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
	} catch (e) {
		console.error(e);
		return;
	}

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