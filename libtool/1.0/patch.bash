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

  declare    x

  for x in ./**/*.@(texi|texinfo|txi); do

    sed -i '

      /^@titlepage/,$ {
        /^@ifinfo$/ d
        /^@end ifinfo$/ d
      }

      s/@refill//g

    ' "$x"

    perl -0 -i -p -e '

      s/^\n\@itemx/@itemx/gm;

    ' "$x"

  done

}; readonly -f main

main "$@"
