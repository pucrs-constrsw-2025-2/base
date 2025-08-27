#!/bin/bash
set -e

get_non_lo_ip() {
  local _ip _non_lo_ip _line _nl=$'\n'
  while IFS=$': \t' read -a _line ;do
    [ -z "${_line%inet}" ] &&
        _ip=${_line[${#_line[1]}>4?1:2]} &&
        [ "${_ip#127.0.0.1}" ] && _non_lo_ip=$_ip
    done< <(LANG=C /sbin/ifconfig)
  printf ${1+-v} $1 "%s${_nl:0:$[${#1}>0?0:1]}" $_non_lo_ip
}

get_non_lo_ip NON_LO_IP
until pg_isready -h $NON_LO_IP --username=postgres --dbname=postgres; do
  >&2 echo "Postgres is not ready..."
  sleep 5
done

>&2 echo "Postgres is ready."