set -e
pbjs -t static-module -w es6 -o SPujPb.js \
 pujbase/libpuj/entries.proto \
 pujbase/libpuj/accents.proto \
 pujbase/libpuj/phrases.proto

pbts -o SPujPb.d.ts SPujPb.js
mv SPujPb.* ../../components
