#
# The authors of this file have waived all copyright and
# related or neighboring rights to the extent permitted by
# law as described by the CC0 1.0 Universal Public Domain
# Dedication. You should have received a copy of the full
# dedication along with this file, typically as a file
# named <CC0-1.0.txt>. If not, it may be available at
# <https://creativecommons.org/publicdomain/zero/1.0/>.
#

set -E -e -u -o pipefail || exit $?
trap exit ERR

LC_ALL=C
readonly LC_ALL
export LC_ALL

adjust_texi() {

  <"$1" \
    sed '
      /^@titlepage/,$ {
        /^@ifinfo$/ d
        /^@end ifinfo$/ d
      }
      s/Franc,ois/Fran@,{c}ois/g
      s/}@c$/}/
      /^@set CODESTD/a\
  @set CHAPTER chapter
    ' \
  >"$1".tmp

  mv -f "$1".tmp "$1"

}; readonly -f adjust_texi

main() {

  declare    x

  mkdir out
  if [[ -f autoconf.texi ]]; then
    for x in autoconf standards; do
      adjust_texi $x.texi
      texi2any --html --no-split $x.texi
      mv -f $x.html out
    done
  else
    cd doc
    for x in autoconf standards; do
      adjust_texi $x.texi
      texi2any --html --no-split $x.texi
      mv -f $x.html ../out
    done
    cd ../man
    for x in *.1; do
      groff -mandoc -T html "$x" >"$x".tmp
      sed '
        /^<!-- CreationDate:/ d
      ' <"$x".tmp >../out/"$x".html
    done
  fi

}; readonly -f main

main "$@"
