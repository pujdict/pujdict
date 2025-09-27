set -e

export PATH=$PATH:$PWD/node_modules/.bin
cd src/.vuepress/public/data

if [ -d pujdict-base ]; then
  git pull || exit 1
else
  origin=$(git remote get-url origin)
  git clone --depth 1 ${origin%/*}/pujdict-base.git || exit 1
fi

python3 generate_font.py < /dev/null

pushd pujdict-base
bash build_dist.sh
popd

bash generate_protobuf.sh
