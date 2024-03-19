/*
precision highp float;

attribute vec3 vtxPos;
attribute vec3 vtxClr;

uniform mat4 prmWorld;
uniform mat4 prmViewProj;

varying vec3 pixPos;
varying vec3 pixClr;

void main() {
	pixPos = (vec4(vtxPos, 1.0) * prmWorld).xyz;
	pixClr = vtxClr;
	gl_Position = vec4(pixPos, 1.0) * prmViewProj;
}
*/

struct Uniforms {
	prmWorld : mat4x4<f32>,
	prmViewProj : mat4x4<f32>,
}
@binding(0) @group(0) var<uniform> xforms : Uniforms;

struct VertexOutput {
	@builtin(position) position : vec4<f32>,
	@location(0) pixPos : vec3<f32>,
	@location(1) pixClr : vec3<f32>,
}

@vertex
fn main (
	@location(0) vtxPos : vec3<f32>,
	@location(1) vtxClr : vec3<f32>
) -> VertexOutput {
	var output : VertexOutput;
	output.pixPos = (vec4(vtxPos, 1.0) * xforms.prmWorld).xyz;
	output.pixClr = vtxClr;
	output.position = vec4(output.pixPos, 1.0) * xforms.prmViewProj;

	return output;
}