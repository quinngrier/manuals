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

url=${1-'https://ftp.gnu.org/gnu/autoconf/autoconf-2.69.tar.gz'}
readonly url

rm -f -r autoconf-2.69.tar.gz autoconf-2.69
wget -O autoconf-2.69.tar.gz -- "$url"
sha256sum -c autoconf-2.69.tar.gz.sha256sum
tar xf autoconf-2.69.tar.gz
cd autoconf-2.69/doc
awk '
  {
    if (sub(/ @$/, " ")) {
      printf "%s", $0;
    } else {
      print;
    }
  }
' autoconf.texi >x
mv x autoconf.texi
texi2any --html --no-split autoconf.texi
cp autoconf.html ../../index.html
cd ../..
rm -f -r autoconf-2.69.tar.gz autoconf-2.69