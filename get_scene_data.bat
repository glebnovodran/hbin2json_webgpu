@echo off


set _CURL_=curl
if not x%1==x (
	set _CURL_=%1\curl.exe
)

set HBIN2JSON_SRC_URL=https://raw.githubusercontent.com/schaban/hbin2json/main

if not exist smp mkdir smp
if not exist smp\webgpu mkdir smp\webgpu

set _DL_=%_CURL_% -o

%_DL_% smp/webgpu/scene_utils.js %HBIN2JSON_SRC_URL%/smp/webgl/scene_utils.js

%_DL_% smp/webgpu/basic.json %HBIN2JSON_SRC_URL%/smp/webgl/basic.json

%_DL_% smp/webgpu/env_sphere.json %HBIN2JSON_SRC_URL%/smp/webgl/env_sphere.json
%_DL_% smp/webgpu/obj_sphere.json %HBIN2JSON_SRC_URL%/smp/webgl/obj_sphere.json
%_DL_% smp/webgpu/pano.json %HBIN2JSON_SRC_URL%/smp/webgl/pano.json

%_DL_% smp/webgpu/skin_anim.json %HBIN2JSON_SRC_URL%/smp/webgl/skin_anim.json
%_DL_% smp/webgpu/skin_model.json %HBIN2JSON_SRC_URL%/smp/webgl/skin_model.json
%_DL_% smp/webgpu/skin_skel.json %HBIN2JSON_SRC_URL%/smp/webgl/skin_skel.json