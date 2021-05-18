#
# The authors of this file have waived all copyright and
# related or neighboring rights to the extent permitted by
# law as described by the CC0 1.0 Universal Public Domain
# Dedication. You should have received a copy of the full
# dedication along with this file, typically as a file
# named <CC0-1.0.txt>. If not, it may be available at
# <https://creativecommons.org/publicdomain/zero/1.0/>.
#

set -E -e -u -o pipefail
trap exit ERR
declare -r -x LC_ALL=C

rm -f bash-3.2.tar.gz
rm -f -r bash-3.2
url=${1-'https://ftp.gnu.org/gnu/bash/bash-3.2.tar.gz'}
wget -O bash-3.2.tar.gz "$url"
sha256sum -c bash-3.2.tar.gz.sha256sum
tar xf bash-3.2.tar.gz
cd bash-3.2
cp lib/readline/doc/hsuser.texi doc
cp lib/readline/doc/rluser.texi doc
cd doc
texi2any --html --no-split bashref.texi
cp bashref.html ../../index.html
cd ../..
rm -f bash-3.2.tar.gz
rm -f -r bash-3.2
