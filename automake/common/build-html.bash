#
# The authors of this file have waived all copyright and
# related or neighboring rights to the extent permitted by
# law as described by the CC0 1.0 Universal Public Domain
# Dedication. You should have received a copy of the full
# dedication along with this file, typically as a file
# named <CC0-1.0.txt>. If not, it may be available at
# <https://creativecommons.org/publicdomain/zero/1.0/>.
#

. /prelude.bash

main() {

  declare    d
  declare -a outs
  declare    x
  declare    y

  outs=()

  #---------------------------------------------------------------------
  # Patching
  #---------------------------------------------------------------------

  for x in ./**/*.texi@(|nfo); do

    sed '

      /^@titlepage/,$ {
        /^@ifinfo$/ d
        /^@end ifinfo$/ d
      }

      s/@value{Francois}/Fran@,{c}ois/g
      s/Fran.ois Pinard/Fran@,{c}ois Pinard/g
      s/Fran.ois'\''s/Fran@,{c}ois'\''s/g
      s/Franc,ois/Fran@,{c}ois/g

      s/^@itemx \(....-..-.. Automake\)/@item \1/

    ' "$x" >"$x.tmp"
    mv "$x.tmp" "$x"

  done

  #---------------------------------------------------------------------
  # Texinfo
  #---------------------------------------------------------------------

  for x in ./**/*.texi@(|nfo); do

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

    y=${x/%.texi@(|nfo)/.html}

    texi2any \
      --html \
      --no-split \
      -o "$y" \
      "$x" \
    ;

    outs+=("$d/$y")

    popd >/dev/null

  done

  #---------------------------------------------------------------------

  readonly outs

  mkdir out
  for x in ${outs[@]+"${outs[@]}"}; do
    y=${x##*/}
    if [[ -f "out/$y" ]]; then
      barf "File already exists: \"out/$y\""
    fi
    mv "$x" out
  done

  #---------------------------------------------------------------------

}; readonly -f main

main "$@"
