#!/usr/bin/env node
/*eslint-env shelljs*/
require('shelljs/global')
mv('blueprint/npmrc', 'blueprint/.npmrc')
mv('blueprint/gitignore', 'blueprint/.gitignore')

