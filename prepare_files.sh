cd src/.vuepress/public/data

if [ -d pujdict-data ]; then
  git pull || exit 1
else
  git clone https://github.com/pujdict/pujdict-data.git || exit 1
fi

python3 generate_sqlite.py < /dev/null
python3 generate_font.py < /dev/null
