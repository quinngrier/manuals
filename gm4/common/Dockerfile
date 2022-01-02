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
  bash \
  build-base \
  perl \
;

COPY texinfo-*.tar.gz /
WORKDIR /
RUN mkdir texinfo
WORKDIR texinfo
RUN tar xzf ../texinfo-*.tar.gz
RUN mv * texinfo
WORKDIR texinfo
RUN ./configure
RUN make
RUN make install

COPY groff-*.tar.gz /
WORKDIR /
RUN mkdir groff
WORKDIR groff
RUN tar xzf ../groff-*.tar.gz
RUN mv * groff
WORKDIR groff
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

COPY m4-*.tar.gz /
WORKDIR /
RUN mkdir m4
WORKDIR m4
RUN tar xzf ../m4-*.tar.gz
RUN mv * m4
WORKDIR m4
COPY *.bash /
RUN bash /build-html.bash
