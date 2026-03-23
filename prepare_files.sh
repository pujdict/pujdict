set -e

export PATH=$PATH:$PWD/node_modules/.bin
cd src/.vuepress/public/data

if [ -d pujbase ]; then
  git pull || exit 1
else
  origin=$(git remote get-url origin)
  git clone --depth 1 ${origin%/*}/pujbase.git || exit 1
fi

pushd pujbase
bash build_dist.sh
popd

bash generate_protobuf.sh

python3 generate_font.py < /dev/null
