@echo off

rem get_scene_data.bat <path_to_where_curl_is>

set _CURL_=curl
if not x%1==x (
	set _CURL_=%1\curl.exe
)

set HBIN2JSON_SRC_URL=https://raw.githubusercontent.com/schaban/hbin2json/main

if not exist smp mkdir smp
if not exist smp\webgpu mkdir smp\webgpu

set _DL_=%_CURL_% -o

for %%i in (scene_utils.js basic.json
            skin_model.json skin_skel.json skin_anim.json
            env_sphere.json obj_sphere.json pano.js
) do (
	echo %%i
	%_DL_% smp/webgpu/%%i %HBIN2JSON_SRC_URL%/smp/webgl/%%i
)