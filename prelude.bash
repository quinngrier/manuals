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

unset prelude_dir
if [[ "$BASH_SOURCE" != */* ]]; then
  prelude_dir=$PWD
elif [[ "${BASH_SOURCE:0:1}" == / ]]; then
  prelude_dir=${BASH_SOURCE%/*}/
elif [[ "${PWD: -1}" == / ]]; then
  prelude_dir=$PWD${BASH_SOURCE%/*}/
else
  prelude_dir=$PWD/${BASH_SOURCE%/*}/
fi
if [[ "${prelude_dir: -1}" == / ]]; then
  prelude_dir+=.
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

# TODO: download2() should eventually replace download().

download2() {

  declare    file
  declare    i
  declare    sum
  declare -a sums
  declare    url
  declare -a urls

  for file; do

    if [[ ! "$file" ]]; then
      barf "Arguments must not be empty."
    fi

    if [[ "$file" == */* ]]; then
      barf "Arguments must not contain slash characters."
    fi

    file=${file%.urls}

    sums=()
    for sum in "$file".*sum; do
      sum=${sum#"$file".}
      sums+=("$sum")
    done
    if ((${#sums[@]} == 0)); then
      barf "No hashes for file: $file"
    fi

    if [[ -f "$file" ]]; then
      for sum in "${sums[@]}"; do
        if ! "$sum" --check --quiet "./$file.$sum"; then
          barf "File failed hash check: $file"
        fi
      done
      continue
    fi

    urls=$(
      sed '
        s/'\''/'\''\\'\'''\''/g
        s/^/'\''/
        s/$/'\''/
      ' <"$file.urls"
    )
    eval "urls=($urls)"
    if ((${#urls[@]} == 0)); then
      barf "No URLs for file: $file"
    fi

    for sum in "${sums[@]}"; do
      sed 's/$/.tmp/' <"$file.$sum" >"$file.tmp.$sum"
    done

    for ((i = 0; i < ${#urls[@]}; ++i)); do
      url=${urls[i]}
      if ! wget -O "$file.tmp" -T 5 -- "$url"; then
        continue
      fi
      for sum in "${sums[@]}"; do
        if ! "$sum" --check --quiet "./$file.tmp.$sum"; then
          continue 2
        fi
      done
      break
    done
    if ((i == ${#urls[@]})); then
      barf "All download attempts failed: $file"
    fi

    mv -f "./$file.tmp" "./$file"

  done

}; readonly -f download2

#-----------------------------------------------------------------------

download_tar_gz() {

  declare    file
  declare    x

  for x in "$prelude_dir"/downloads/"$1".tar*.urls; do
    x=${x%.urls}
    file=${x##*/}
    x=${x#"$prelude_dir/downloads/"}
    download "$x"
    break
  done
  readonly file

  case $file in *.tar)
    gzip -n <"$file" >"$file.gz"
  ;; *.tar.Z)
    gzip -d <"$file" | gzip -n >"${file/%.Z/.gz}"
    rm "$file"
  ;; *.tar.bz2)
    bzip2 -d <"$file" | gzip -n >"${file/%.bz2/.gz}"
    rm "$file"
  ;; *.tar.gz)
    :
  ;; *.tar.xz)
    xz -d <"$file" | gzip -n >"${file/%.xz/.gz}"
    rm "$file"
  ;; *)
    barf "Unknown archive file: \"$file\"."
  esac

}; readonly -f download_tar_gz

#-----------------------------------------------------------------------

extract() {

  declare    x

  for x; do
    if [[ "$x" != [./]* ]]; then
      x=./$x
    fi
    case $x in *.tar)
      tar xf "$x"
    ;; *.tar.gz)
      tar xzf "$x"
    ;; *.tar.xz)
      tar xJf "$x"
    ;; *.zip)
      unzip "$x"
    esac
  done

}; readonly -f extract

#-----------------------------------------------------------------------

make_ignore_file() {

  declare    x

  cat <<'EOF'
#
# The authors of this file have waived all copyright and
# related or neighboring rights to the extent permitted by
# law as described by the CC0 1.0 Universal Public Domain
# Dedication. You should have received a copy of the full
# dedication along with this file, typically as a file
# named <CC0-1.0.txt>. If not, it may be available at
# <https://creativecommons.org/publicdomain/zero/1.0/>.
#

#
# This is an ignore file. Any subdirectories listed in this file will be
# ignored by this directory's index.html page and not recursed into for
# further indexing.
#
# Subdirectories should be written with a trailing slash, like "foo/".
# If a subdirectory is listed in both an ignore file and a skip file,
# the ignore file takes precedence. Subdirectories beginning with a .
# character are always ignored.
#
EOF

  if (($# > 0)); then
    echo
    for x; do
      if [[ "$x" != */ ]]; then
        x+=/
      fi
      printf '%s\n' "$x"
    done
  fi

}; readonly -f make_ignore_file

#-----------------------------------------------------------------------

make_skip_file() {

  declare    x

  cat <<'EOF'
#
# The authors of this file have waived all copyright and
# related or neighboring rights to the extent permitted by
# law as described by the CC0 1.0 Universal Public Domain
# Dedication. You should have received a copy of the full
# dedication along with this file, typically as a file
# named <CC0-1.0.txt>. If not, it may be available at
# <https://creativecommons.org/publicdomain/zero/1.0/>.
#

#
# This is a skip file. Any subdirectories listed in this file will be
# linked to by this directory's index.html page but not recursed into
# for further indexing.
#
# Subdirectories should be written with a trailing slash, like "foo/".
# If a subdirectory is listed in both an ignore file and a skip file,
# the ignore file takes precedence. Subdirectories beginning with a .
# character are always ignored.
#
EOF

  if (($# > 0)); then
    echo
    for x; do
      if [[ "$x" != */ ]]; then
        x+=/
      fi
      printf '%s\n' "$x"
    done
  fi

}; readonly -f make_skip_file

#-----------------------------------------------------------------------
