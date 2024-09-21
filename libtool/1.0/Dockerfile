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
  m4 \
  perl \
;

COPY groff-*.tar.gz /
WORKDIR /
RUN mkdir groff
WORKDIR groff
RUN tar xzf ../groff-*.tar.gz
RUN mv * groff
WORKDIR groff
RUN ./configure
RUN make
RUN make install

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

COPY libtool-*.tar.gz /
WORKDIR /
RUN mkdir libtool
WORKDIR libtool
RUN tar xzf ../libtool-*.tar.gz
RUN mv * libtool
WORKDIR libtool
RUN ./configure \
  --build=i386-unknown-linux-gnu \
  --host=i386-unknown-linux-gnu \
;

COPY *.bash.tmp /
RUN bash /patch.bash.tmp
RUN bash /render.bash.tmp
