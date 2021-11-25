#
# The authors of this file have waived all copyright and
# related or neighboring rights to the extent permitted by
# law as described by the CC0 1.0 Universal Public Domain
# Dedication. You should have received a copy of the full
# dedication along with this file, typically as a file
# named <CC0-1.0.txt>. If not, it may be available at
# <https://creativecommons.org/publicdomain/zero/1.0/>.
#

FROM alpine

RUN apk --no-cache add \
  build-base \
  perl \
;

COPY texinfo-6.7.tar.gz /
WORKDIR /
RUN tar xf texinfo-6.7.tar.gz
WORKDIR /texinfo-6.7
RUN ./configure
RUN make
RUN make install

COPY groff-1.22.4.tar.gz /
WORKDIR /
RUN tar xf groff-1.22.4.tar.gz
WORKDIR /groff-1.22.4
RUN sed -i.old \
  -e 's/{ "\\\\-", "2212" }/{ "\\\\-", "002D" }/' \
  src/libs/libgroff/glyphuni.cpp \
;
RUN sed -i.old \
  -e 's/{ "002C", "," },/& { "002D", "\\\\-" },/' \
  src/libs/libgroff/uniglyph.cpp \
;
RUN ./configure
RUN make
RUN make install

COPY bash-4.0-rc1.tar.gz /
WORKDIR /
RUN tar xf bash-4.0-rc1.tar.gz
WORKDIR /bash-4.0-rc1
RUN cp lib/readline/doc/hsuser.texi doc
RUN cp lib/readline/doc/rluser.texi doc
WORKDIR doc
RUN texi2any --html --no-split bashref.texi
RUN mkdir out
RUN mv bashref.html out
RUN ( \
  for x in *.1; do \
    groff -mandoc -T html $x >tmp || exit $?; \
    sed '/^<!-- CreationDate:/ d' tmp >out/$x.html || exit $?; \
  done; \
)
