#
# The authors of this file have waived all copyright and
# related or neighboring rights to the extent permitted by
# law as described by the CC0 1.0 Universal Public Domain
# Dedication. You should have received a copy of the full
# dedication along with this file, typically as a file
# named <CC0-1.0.txt>. If not, it may be available at
# <https://creativecommons.org/publicdomain/zero/1.0/>.
#

case ${BASH_BOOTSTRAP+x}y$# in
  y0) BASH_BOOTSTRAP=x exec bash - "$0" ;;
  y*) BASH_BOOTSTRAP=x exec bash - "$0" "$@" ;;
esac
unset BASH_BOOTSTRAP

case ${BASH_VERSION-} in
  4.[1-9]* | [5-9]* | [1-9][0-9]*)
    :
  ;;
  *)
    printf '%s\n' "$0: bash 4.1 or later is required" >&2
    exit 1
  ;;
esac

set -E -e -u -o pipefail || exit
trap exit ERR

shopt -s \
  dotglob \
  extglob \
  globstar \
  nullglob \
;

declare -r -x LC_ALL=C
