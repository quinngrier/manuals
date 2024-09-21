#
# The authors of this file have waived all copyright and
# related or neighboring rights to the extent permitted by
# law as described by the CC0 1.0 Universal Public Domain
# Dedication. You should have received a copy of the full
# dedication along with this file, typically as a file
# named <CC0-1.0.txt>. If not, it may be available at
# <https://creativecommons.org/publicdomain/zero/1.0/>.
#

. /prelude.bash.tmp

output() {

  declare    dst
  declare    src

  for src; do
    case $src in '' | /* | ../* | */../* | */..)
      barf "Invalid parameter"
    esac
    if [[ ! -e "$src" ]]; then
      barf "File does not exist: $src"
    fi
    src=${src%%+(/)}
    dst=/out.tmp/$src
    if [[ -e "$dst" ]]; then
      barf "File already exists: $dst"
    fi
    mkdir -p "$dst"
    rmdir "$dst"
    cp -L -R "./$src" "$dst"
  done

}; readonly -f output

main() {

  declare    d
  declare    x
  declare    y

  #---------------------------------------------------------------------
  # Compile all Texinfo documents
  #---------------------------------------------------------------------

  for x in ./**/*.@(texi|texinfo|txi); do

    y=$(
      sed -n '
        /^@titlepage/ {
          p
          q
        }
      ' "$x"
    )
    if [[ ! "$y" ]]; then
      continue
    fi

    d=${x%/*}
    x=${x##*/}

    pushd "$d" >/dev/null

    y=${x/%.*/.html}

    texi2any \
      --html \
      --no-split \
      -o "$y" \
      "$x" \
    ;

    output "$y"

    popd >/dev/null

  done

  #---------------------------------------------------------------------
  # Compile all man pages
  #---------------------------------------------------------------------

  for x in ./**/*.1; do
    d=${x%/*}
    pushd "$d" >/dev/null
    x=./${x##*/}
    if [[ '' \
      || "$x" == ./._* \
      || "$x" == ./ChangeLog* \
      || "$x" == ./ansi2knr* \
    ]]; then
      popd >/dev/null
      continue
    fi
    y=$x.html
    groff -mandoc -T html "$x" >"$y.tmp1"
    sed '
      /^<!-- CreationDate:/ d
    ' <"$y.tmp1" >"$y.tmp2"
    mv -f "$y.tmp2" "$y"
    output "$y"
    popd >/dev/null
  done


  #---------------------------------------------------------------------

}; readonly -f main

main "$@"
