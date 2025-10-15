set -e
pbjs -t static-module -w es6 -o SPujPb.js \
 pujdict-base/libpuj/entries.proto \
 pujdict-base/libpuj/accents.proto \
 pujdict-base/libpuj/phrases.proto

pbts -o SPujPb.d.ts SPujPb.js
mv SPujPb.* ../../components
