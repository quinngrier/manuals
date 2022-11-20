//
// The authors of this file have waived all copyright and
// related or neighboring rights to the extent permitted by
// law as described by the CC0 1.0 Universal Public Domain
// Dedication. You should have received a copy of the full
// dedication along with this file, typically as a file
// named <CC0-1.0.txt>. If not, it may be available at
// <https://creativecommons.org/publicdomain/zero/1.0/>.
//

#include <errno.h>

#include <cstdlib>
#include <iostream>
#include <stdexcept>
#include <string>

#include <sys/stat.h>
#include <sys/time.h>
#include <utime.h>

int main(int const argc, char ** const argv) {
  char const * const argv0 = argc > 0 ? argv[0] : "do_timestamps";
  try {
    std::cin.exceptions(std::cin.badbit);
    std::string file;
    long long lastmod;
    while (std::getline(std::cin, file)) {
      auto const i = file.rfind(' ');
      lastmod = std::strtoll(&file.c_str()[i + 1], nullptr, 10);
      file.resize(i);
      struct stat st = {0};
      if (lstat(file.c_str(), &st) != 0) {
        int const e = errno;
        if (e == ENOENT) {
          continue;
        }
        throw std::runtime_error("lstat() failed on " + file + ".");
      }
      if (S_ISLNK(st.st_mode)) {
        continue;
      }
      struct utimbuf tb = {0};
      tb.actime = static_cast<time_t>(lastmod);
      tb.modtime = tb.actime;
      if (utime(file.c_str(), &tb) != 0) {
        throw std::runtime_error("utime() failed on " + file + ".");
      }
    }
  } catch (std::exception const & e) {
    try {
      std::cerr << argv0 << ": Error: " << e.what() << "\n";
    } catch (...) {
    }
    return EXIT_FAILURE;
  } catch (...) {
    try {
      std::cerr << argv0 << ": Unknown error.\n";
    } catch (...) {
    }
    return EXIT_FAILURE;
  }
  return EXIT_SUCCESS;
}
