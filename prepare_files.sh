cd src/.vuepress/public/data

if [ -d pujdict-data-utils ]; then
  git pull || exit 1
else
  git clone --depth 1 https://github.com/pujdict/pujdict-data-utils.git || exit 1
fi

python3 generate_font.py < /dev/null

cd pujdict-data-utils
bash build_dist.sh
