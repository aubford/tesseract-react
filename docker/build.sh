#!/bin/bash -el

script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
tmp_dir="${script_path}/tmp"
image_name="tesseractpixel/tesseract-ui:x64"

mkdir -p $tmp_dir

cp \
  "${script_path}/../package.json" \
  "${script_path}/../yarn.lock" \
  "${script_path}/../webpack.config.js" \
  "${script_path}/../.eslintrc" \
  "${script_path}/tmp"

cp -R "${script_path}/../src" "${script_path}/tmp/src"
cp -R "${script_path}/../webpack" "${script_path}/tmp/webpack"

docker build -t $image_name -f "${script_path}/Dockerfile" "${script_path}"

if [[ $PUSH == true ]]; then
  docker push $image_name
fi

rm -rf $tmp_dir
