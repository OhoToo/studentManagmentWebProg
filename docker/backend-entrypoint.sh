#!/bin/sh
set -eu

if [ -z "${JWT_SECRET:-}" ]; then
    if [ ! -s /app/secrets/jwt-secret ]; then
        umask 077
        od -An -N32 -tx1 /dev/urandom | tr -d ' \n' > /app/secrets/jwt-secret
    fi
    JWT_SECRET=$(cat /app/secrets/jwt-secret)
    export JWT_SECRET
fi

exec java -jar /app/app.jar
