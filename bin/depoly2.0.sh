#!/usr/bin/env bash

if [[ -z $(which aws) ]]; then
  echo 'aws cli must be installed on your PC'
  exit 1
fi

MY_DIR=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
APP_DIR=$(dirname ${MY_DIR})/build
BRANCH=$([ -n "$1" ] && echo "$1" || echo 'dev')

if [ ${BRANCH} != 'master' ]; then
    BUCKET='s3://www-dev.404.md/'
    DIST_ID='EZZ1YSAXOSK4Y'
    MAX_AGE='600'
else
    BUCKET='s3://www.404.md/'
    DIST_ID='E3E50UDRANKEKH'
    MAX_AGE='604800'
fi

echo "Starting compiling"
npm run compile

echo "Synchronizing build directory"
aws s3 sync ${APP_DIR} ${BUCKET}

echo "Invalidating CloudFront"
aws cloudfront create-invalidation --distribution-id ${DIST_ID} --paths '/*'

echo "Done"