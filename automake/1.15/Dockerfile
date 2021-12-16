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

COPY automake-1.15.tar.gz /
WORKDIR /
RUN tar xf automake-1.15.tar.gz
WORKDIR /automake-1.15/doc
RUN mkdir out
RUN texi2any --html --no-split automake.texi
RUN mv -f automake.html out
RUN texi2any --html --no-split automake-history.texi
RUN mv -f automake-history.html out
