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

mkdir out
if test -f automake.texi; then
  texi2any --html --no-split automake.texi
  mv -f automake.html out
else
  cd doc
  texi2any --html --no-split automake.texi
  mv -f automake.html ../out
  if test -f automake-history.texi; then
    texi2any --html --no-split automake-history.texi
    mv -f automake-history.html ../out
  fi
fi
