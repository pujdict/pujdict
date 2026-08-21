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

# SourceForge 带宽受限，对数据文件分别用 gzip 压缩，前端用浏览器原生 DecompressionStream('gzip') 解压。
for f in entries.pb accents.pb phrases.pb; do
  if [ -f "pujbase/dist/$f" ]; then
    gzip -9 -f -c "pujbase/dist/$f" > "pujbase/dist/$f.gz"
  fi
done

bash generate_protobuf.sh

python3 generate_font.py < /dev/null
