#
# The authors of this file have waived all copyright and
# related or neighboring rights to the extent permitted by
# law as described by the CC0 1.0 Universal Public Domain
# Dedication. You should have received a copy of the full
# dedication along with this file, typically as a file
# named <CC0-1.0.txt>. If not, it may be available at
# <https://creativecommons.org/publicdomain/zero/1.0/>.
#

. ./prelude.bash

main() {

  declare    d
  declare    x
  declare    y
  declare -a outs

  outs=()

  for d in \
    ./doc \
    ./documentation \
  ; do

    if [[ ! -d "$d" ]]; then
      continue
    fi

    pushd "$d" >/dev/null

    for x in ./*.texi; do

      y=$(sed -n '/^@setfilename/ p' "$x")
      if [[ ! "$y" ]]; then
        continue
      fi

      y=${x/%.texi/.html}
      texi2any \
        --html \
        --no-split \
        -I ../lib/readline/doc \
        -o "$y" \
        "$x" \
      ;
      outs+=("$d/$y")

    done

    for x in ./*.[1-9]; do

      y=$x.html
      groff -mandoc -T html "$x" >"$y.tmp"
      sed '
        /^<!-- CreationDate:/ d
      ' <"$y.tmp" >"$y"
      outs+=("$d/$y")

    done

    popd >/dev/null

  done

  readonly outs

  mkdir out
  for x in ${outs[@]+"${outs[@]}"}; do
    y=${x##*/}
    if [[ -f "out/$y" ]]; then
      barf "File already exists: \"out/$y\""
    fi
    mv "$x" out
  done

}; readonly -f main

main "$@"
