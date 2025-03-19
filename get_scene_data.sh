#!/bin/sh

FMT_BOLD=${NO_FMT-"\e[1m"}
FMT_GREEN=${NO_FMT-"\e[32m"}
FMT_OFF=${NO_FMT-"\e[0m"}

HBIN2JSON_SRC_URL="https://raw.githubusercontent.com/schaban/hbin2json/main"
DL_MODE="NONE"
DL_CMD=""

if [ -x "`command -v curl`" ]; then
	DL_MODE="CURL"
	DL_CMD="curl -o"
elif [ -x "`command -v wget`" ]; then
	DL_MODE="WGET"
	DL_CMD="wget -O"
fi

printf "Downloading mode $DL_MODE.\nUsing $DL_CMD\n"

printf "$FMT_BOLD$FMT_GREEN""Downloading hbin2json files...\n$FMT_OFF"

$DL_CMD smp/webgpu/basic.json $HBIN2JSON_SRC_URL/smp/webgl/basic.json
$DL_CMD smp/webgpu/env_sphere.json $HBIN2JSON_SRC_URL/smp/webgl/env_sphere.json
$DL_CMD smp/webgpu/obj_sphere.json $HBIN2JSON_SRC_URL/smp/webgl/obj_sphere.json
$DL_CMD smp/webgpu/pano.json $HBIN2JSON_SRC_URL/smp/webgl/pano.json
$DL_CMD smp/webgpu/skin_anim.json $HBIN2JSON_SRC_URL/smp/webgl/skin_anim.json
$DL_CMD smp/webgpu/skin_model.json $HBIN2JSON_SRC_URL/smp/webgl/skin_model.json
$DL_CMD smp/webgpu/skin_skel.json $HBIN2JSON_SRC_URL/smp/webgl/skin_skel.json

$DL_CMD smp/webgpu/scene_utils.js $HBIN2JSON_SRC_URL/smp/webgl/scene_utils.js
