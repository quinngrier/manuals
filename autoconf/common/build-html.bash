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

  awk '
    {
      if (sub(/ @$/, " ")) {
        printf "%s", $0;
      } else {
        print;
      }
    }
  ' "$1" >"$1".tmp
  mv -f "$1".tmp "$1"

}; readonly -f adjust_texi

main() {

  declare    x

  mkdir out
  if [[ -f autoconf.texi ]]; then
    adjust_texi autoconf.texi
    texi2any --html --no-split autoconf.texi
    mv -f autoconf.html out
  else
    cd doc
    adjust_texi autoconf.texi
    texi2any --html --no-split autoconf.texi
    mv -f autoconf.html ../out
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
