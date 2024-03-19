/*
precision highp float;

varying vec3 pixPos;
varying vec3 pixClr;

void main() {
	gl_FragColor = vec4(pixClr, 1.0);
}
*/

@fragment
fn main(
	@location(0) pixPos : vec3<f32>,
	@location(1) pixClr : vec3<f32>,
) -> @location(0) vec4<f32> {
	return vec4(pixClr, 1.0);
}
