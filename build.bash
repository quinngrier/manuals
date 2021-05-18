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

shopt -s globstar

for dir in ./**/; do
  if [[ -f $dir/.leaf ]]; then
    continue
  fi

  (
    cd $dir

    >index.html

    cat <<'EOF' >>index.html
<!DOCTYPE html>
<!--
The authors of this file have waived all copyright and
related or neighboring rights to the extent permitted by
law as described by the CC0 1.0 Universal Public Domain
Dedication. You should have received a copy of the full
dedication along with this file, typically as a file
named <CC0-1.0.txt>. If not, it may be available at
<https://creativecommons.org/publicdomain/zero/1.0/>.
-->
<html>
<head>
<style>

@import url("https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap");

* {
  font-family: "Source Code Pro", monospace;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

body {
  margin: 1em;
}

ul {
  border-left: 1px solid black;
}

li {
  margin-left: 1em;
}

</style>
</head>
<body>
EOF

    h=
    d=.
    x=$dir
    while [[ $x != ./ ]]; do
      x=${x%/}
      h="/<a href=\"$d\">${x##*/}</a>$h"
      d+=/..
      d=${d#./}
      x=${x%/*}/
    done
    h="<a href=\"$d\">manuals</a>$h"

    cat <<EOF >>index.html
$h
<ul>
EOF

    for x in */; do
      x=${x%/}
      cat <<EOF >>index.html
<li><a href="$x">$x</a></li>
EOF
    done

    cat <<'EOF' >>index.html
</ul>
</body>
</html>
EOF

  )
done

