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
  declare    edition
  declare -a outs
  declare    v
  declare    x
  declare    y

  v=$1
  readonly v

  outs=()

  #---------------------------------------------------------------------
  # Patching
  #---------------------------------------------------------------------

  for x in ./**/*.@(texi|texinfo|txi); do

    edition=$(
      sed -n '
        /^@set edition / {
          s/^@set edition *//
          p
          q
        }
      ' "$x"
    )

    perl -0 -i -p \
      -e 's/^\@sub(subsection \@code{\@\@syncodeindex})$/\@$1/gm;' \
      -e 's/^(\@settitle Texinfo) \@value{edition}/$1 '$edition'/gm;' \
      -e 's/^(\n\@item)x( \@key{PREVIOUS})/$1$2/gm;' \
      -e 's/^(\n\@item)x( \@\@afivepaper)$/$1$2/gm;' \
      -e 's/^(\n\@item)x( UTF-8)$/$1$2/gm;' \
      -e 's/^(\n\@item)x( ISO-8859-1\n\@itemx ISO-8859-15\n\@item)( ISO-8859-2)$/$1$2x$3/gm;' \
      -e 's/^(\n\@item)x( \@\@ifnotinfo)$/$1$2/gm;' \
      -e 's/^(This[^\n]*\n\@item)x( ISO-8859-1)$/$1$2/gm;' \
      "$x" \
    ;

    case $v in ([0-5].* | 6.[0-7])
      perl -0 -i -p \
        -e 's/^\@ifinfo/\@ifnottex/gm;' \
        -e 's/^\@end ifinfo/\@end ifnottex/gm;' \
        "$x" \
      ;
    esac

    if [[ $v == 3.12 ]]; then
      perl -0 -i -p \
        -e 's/^\* New Texinfo Mode Commands::/\@c $&/gm;' \
        -e 's/^\* New Commands::/\@c $&/gm;' \
        "$x" \
      ;
    fi

    if [[ $v == 4.1 ]]; then
      perl -0 -i -p \
        -e 's/^(\@appendix)sub(sec ADDENDUM)/$1$2/gm;' \
        "$x" \
      ;
    fi

    if [[ $v == 5.[0-2] || $v == 6.[0-8] ]]; then
      perl -0 -i -p \
        -e 's/^(\* Font substitution::[^\n]*)/$1\n* Other::/gm;' \
        "$x" \
      ;
    fi

    if [[ $v == 6.[2-6] ]]; then
      perl -0 -i -p \
        -e 's/^\@top GNU サンプル$/$&\n\@include version.texi/gm;' \
        "$x" \
      ;
    fi

  done

  for x in ./**/*.[1-9]; do

    perl -0 -i -p \
      -e 's/^\.so man1\//.so /gm;' \
      "$x" \
    ;

  done

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

    outs+=("$d/$y")

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
