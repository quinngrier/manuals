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

COPY automake-*.tar.gz /
WORKDIR /
RUN mkdir automake
WORKDIR automake
RUN tar xzf ../automake-*.tar.gz
RUN mv * automake
WORKDIR automake
COPY *.bash /
RUN bash /build-html.bash
