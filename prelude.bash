#
# The authors of this file have waived all copyright and
# related or neighboring rights to the extent permitted by
# law as described by the CC0 1.0 Universal Public Domain
# Dedication. You should have received a copy of the full
# dedication along with this file, typically as a file
# named <CC0-1.0.txt>. If not, it may be available at
# <https://creativecommons.org/publicdomain/zero/1.0/>.
#

case ${BASH_BOOTSTRAP+x}y$# in
  y0) BASH_BOOTSTRAP=x exec bash - "$0" ;;
  y*) BASH_BOOTSTRAP=x exec bash - "$0" "$@" ;;
esac
unset BASH_BOOTSTRAP

case ${BASH_VERSION-} in
  4.[1-9]* | [5-9]* | [1-9][0-9]*)
    :
  ;;
  *)
    printf '%s\n' "$0: bash 4.1 or later is required" >&2
    exit 1
  ;;
esac

set -E -e -u -o pipefail || exit
trap exit ERR

shopt -s \
  dotglob \
  extglob \
  globstar \
  nullglob \
;

declare -r -x LC_ALL=C

#-----------------------------------------------------------------------
# prelude_dir
#-----------------------------------------------------------------------

if [[ "$BASH_SOURCE" == */* ]]; then
  prelude_dir=${BASH_SOURCE%/*}/
  if [[ "$prelude_dir" != /* ]]; then
    if [[ "$PWD" == / ]]; then
      prelude_dir=/$prelude_dir
    else
      prelude_dir=$PWD/$prelude_dir
    fi
  fi
else
  prelude_dir=$PWD
fi
if [[ "$prelude_dir" == */ ]]; then
  prelude_dir+=.
fi
if [[ "$prelude_dir" != //* ]]; then
  while [[ "$prelude_dir" == */./* ]]; do
    prelude_dir=${prelude_dir//'/./'/'/'}
  done
  while [[ "$prelude_dir" == *//* ]]; do
    prelude_dir=${prelude_dir//'//'/'/'}
  done
  if [[ "$prelude_dir" != /. ]]; then
    prelude_dir=${prelude_dir%/.}
  fi
fi
readonly prelude_dir

#-----------------------------------------------------------------------

barf() {

  declare    x

  x="$@"
  readonly x

  printf '%s\n' "$0: Error: $x" >&2

  exit 1

}; readonly -f barf

#-----------------------------------------------------------------------

download() {

  declare    file
  declare    path
  declare    sum
  declare -a sums
  declare    url
  declare    urls

  path=./$1
  readonly path
  shift

  file=${path##*/}
  readonly file

  rm -f "$file"
  ln -s "$prelude_dir/downloads/$path" "$file"

  sums=()
  for sum in "$prelude_dir/downloads/$path".*sum; do
    sum=${sum##*.}
    sums+=($sum)
    rm -f "$file.$sum"
    ln -s "$prelude_dir/downloads/$path.$sum" "$file.$sum"
  done

  if ((${#sums[@]} == 0)); then
    printf '%s\n' "No hashes for $file" >&2
    exit 1
  fi

  if [[ -f "$file" ]]; then
    for sum in ${sums[@]}; do
      if ! $sum -c --quiet "$file.$sum"; then
        rm "$prelude_dir/downloads/$path"
        break
      fi
    done
  fi

  if [[ ! -f "$file" ]]; then
    urls=$(cat "$prelude_dir/downloads/$path.urls")
    url=
    for url in $urls; do
      if ! wget -O - -T 5 -- "$url" >"$file"; then
        rm "$prelude_dir/downloads/$path"
        continue
      fi
      for sum in ${sums[@]}; do
        if ! $sum -c --quiet "$file.$sum"; then
          rm "$prelude_dir/downloads/$path"
          continue 2
        fi
      done
      break
    done
    if [[ ! "$url" ]]; then
      printf '%s\n' "No URLs for $file" >&2
      exit 1
    fi
    if [[ ! -f "$file" ]]; then
      printf '%s\n' "All downloads failed for $file" >&2
      exit 1
    fi
  fi

  rm -f "$file.flat"
  cp -L "$file" "$file.flat"

  rm "$file"
  for sum in ${sums[@]}; do
    rm "$file.$sum"
  done

  mv -f "$file.flat" "$file"

}; readonly -f download

#-----------------------------------------------------------------------
