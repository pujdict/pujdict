set -e
pbjs -t static-module -w es6 -o SPujPb.js \
 pujdict-base/src/entries.proto \
 pujdict-base/src/accents.proto \
 pujdict-base/src/phrases.proto

pbts -o SPujPb.d.ts SPujPb.js
mv SPujPb.* ../../components
