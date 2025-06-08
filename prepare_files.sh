cd src/.vuepress/public/data

if [ -d pujdict-base ]; then
  git pull || exit 1
else
  git clone --depth 1 https://github.com/pujdict/pujdict-base.git || exit 1
fi

python3 generate_font.py < /dev/null

cd pujdict-base
bash build_dist.sh
