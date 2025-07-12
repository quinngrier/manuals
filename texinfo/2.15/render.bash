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

main() {

  declare    d
  declare    v
  declare    x
  declare    y

  v=$1
  readonly v

  #---------------------------------------------------------------------
  # Texinfo
  #---------------------------------------------------------------------

  for x in ./**/*.@(texi|texinfo|txi); do

    if [[ "$x" == */tp/* ]]; then
      continue
    fi

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

    y=${x/%.@(texi|texinfo|txi)/.html}

    case $v in ([0-5].* | 6.[0-7])
      texi2any \
        --html \
        --no-split \
        -o "$y" \
        "$x" \
      ;
    ;; *)
      texi2any \
        --html \
        --no-split \
        -c HTML_MATH=mathjax \
        -c MATHJAX_SCRIPT=mathjax/tex-svg.js \
        -o "$y" \
        "$x" \
      ;
    esac

    output "$y"

    popd >/dev/null

  done

  #---------------------------------------------------------------------
  # Groff
  #---------------------------------------------------------------------

  for x in ./**/*.[1-9]; do

    y=$(
      sed -n '
        /^\.[A-Za-z]/ {
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

    y=$x.html

    groff -mandoc -T html "$x" >"$y.tmp"
    sed '
      /^<!-- CreationDate:/ d
    ' <"$y.tmp" >"$y"

    output "$y"

    popd >/dev/null

  done

  #---------------------------------------------------------------------

}; readonly -f main

main "$@"
