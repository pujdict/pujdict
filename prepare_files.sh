cd src/.vuepress/public/data

if [ -d pujdict-data-utils ]; then
  git pull || exit 1
else
  git clone https://github.com/pujdict/pujdict-data-utils.git || exit 1
fi

python3 generate_sqlite.py < /dev/null
python3 generate_font.py < /dev/null
