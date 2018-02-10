#!/bin/bash
#
#   Copyright (C) 2018 Simão Gomes Viana
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#

set -e

wget 'https://github.com/xdevs23/material-library/archive/master.zip' -O material-library.zip
unzip material-library.zip
rm material-library.zip
mv material-library-master material-library
cd material-library

mkdir -p tmp

libs() {
cat <<EOF
https://code.jquery.com/jquery-3.3.1.min.js
https://ajax.googleapis.com/ajax/libs/angularjs/1.6.7/angular.min.js
EOF
}

echo "Downloading Roboto fonts..."
wget 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0B0J8hsRkk91LRjU4U1NSeXdjd1U/robotottf.zip' -O tmp/roboto.zip

echo "Downloading JS libraries..."
while read lib; do
  wget "$lib" -O js/$(basename "$lib")
  echo js/$(basename "$lib") >> .gitignore
  sort -u .gitignore > .gitignore-new
  mv .gitignore-new .gitignore
done < <(libs)

echo "Extracting roboto fonts"
mkdir -p fonts
unzip tmp/roboto.zip -d fonts

echo "Cleaning up"
rm -rf ./tmp

echo "Done. The library is in material-library/"

exit 0
