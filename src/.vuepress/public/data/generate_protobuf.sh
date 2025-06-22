set -e
pbjs -t static-module -w es6 -o SPujPb.js pujdict-base/src/entries.proto pujdict-base/src/accents.proto
mv SPujPb.js ../../components/SPujPb.js
