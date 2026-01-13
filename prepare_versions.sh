# This script is only used in CI to generate right git version info.
# The git hash & date info in the .env files would be replaced.

set -e

GIT_HASH_SITE=$(git rev-parse --short HEAD)
GIT_DATE_SITE=$(git log -1 --format=%cs)
pushd src/.vuepress/public/data/pujbase
GIT_HASH_DATA=$(git rev-parse --short HEAD)
GIT_DATE_DATA=$(git log -1 --format=%cs)
popd

sed_i_env() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "$@" .env
        sed -i '' "$@" .env.production
    else
        sed -i "$@" .env
        sed -i "$@" .env.production
    fi
}

sed_i_env "s/^GIT_HASH_SITE=.*/GIT_HASH_SITE=${GIT_HASH_SITE}/"
sed_i_env "s/^GIT_HASH_SITE=.*/GIT_HASH_SITE=${GIT_HASH_SITE}/"
sed_i_env "s/^GIT_DATE_SITE=.*/GIT_DATE_SITE=${GIT_DATE_SITE}/"
sed_i_env "s/^GIT_DATE_SITE=.*/GIT_DATE_SITE=${GIT_DATE_SITE}/"
sed_i_env "s/^GIT_HASH_DATA=.*/GIT_HASH_DATA=${GIT_HASH_DATA}/"
sed_i_env "s/^GIT_HASH_DATA=.*/GIT_HASH_DATA=${GIT_HASH_DATA}/"
sed_i_env "s/^GIT_DATE_DATA=.*/GIT_DATE_DATA=${GIT_DATE_DATA}/"
sed_i_env "s/^GIT_DATE_DATA=.*/GIT_DATE_DATA=${GIT_DATE_DATA}/"
