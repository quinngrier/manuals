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

shopt -s globstar

for dir in ./**/; do
  (

    cd $dir

    if [[ -f date ]]; then
      exit 0
    fi

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
  line-height: 100%;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

body {
  margin: 1em;
}

ul {
  margin-left: 0.5em;
  margin-top: 0.2em;
  position: relative;
}

div {
  border-left: 1px solid lightgray;
  bottom: 0.5em;
  left: 0;
  position: absolute;
  right: 100%;
  top: 0;
}

li {
  margin-left: 0.2em;
}

li:before {
  border-top: 1px solid lightgray;
  content: "";
  display: inline-block;
  height: 3px;
  left: -0.2em;
  position: relative;
  vertical-align: middle;
  width: 0.5em;
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
<div></div>
EOF

    xs=$(
      for x in */; do
        x=${x%/}
        if [[ -f $x/date ]]; then
          d=$(cat $x/date)
        else
          d=0000-00-00
        fi
        printf '%s\n' "$d $x"
      done | sort | cut -d ' ' -f 2
    )

    for x in $xs; do
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

