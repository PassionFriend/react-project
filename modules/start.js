import path from 'path'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import build from './build'
import { log, logError } from './LogUtils'
import { getPackageJSON } from './PackageUtils'
import { DEV_PORT, DEV_HOST, PUBLIC_DIR, SERVER_RENDERING, AUTO_RELOAD } from './Constants'

// should be created by build task already
const WEBPACK_PATH = path.join(PUBLIC_DIR, 'webpack.config.js')

const PROD = process.env.NODE_ENV === 'production'

function getAppWebpackConfig() {
  return require(WEBPACK_PATH)
}

export default function start(cb) {
  validateEnv()
  if (PROD) {
    logDXStartWarning()
  } else {
    checkDependencies()
    build(() => {
      const appServerPath = path.join(process.cwd(), '.build', 'server.js')
      require(appServerPath)
      runDevServer(cb)
    })
  }
}

function validateEnv() {
  if (!PROD && AUTO_RELOAD === 'hot' && SERVER_RENDERING) {
    logError('Hot Module Replacement is disabled because SERVER_RENDERING is enabled.')
  }
}

function checkDependencies() {
  log('checking app dependencies')
  const pkg = getPackageJSON()
  const blueprintPkg = require('../create-react-project/blueprint/package.json')
  const missingDeps = []
  const differentDeps = []
  for (const key in blueprintPkg.dependencies) {
    const blueprintVersion = `${key}@${blueprintPkg.dependencies[key]}`
    const pkgVersion = `${key}@${pkg.dependencies[key]}`
    if (!pkg.dependencies[key]) {
      missingDeps.push(blueprintVersion)
    } else if (pkgVersion !== blueprintVersion) {
      differentDeps.push({ pkgVersion, blueprintVersion })
    }
  }

  if (differentDeps.length) {
    log('Some of your dependencies don\'t match what I expect')
    differentDeps.forEach((dep) => {
      log(`You have: ${dep.pkgVersion} and I expect ${dep.blueprintVersion}`)
    })
    log('You might want to `npm install` the versions I expect.')
  }

  if (missingDeps.length) {
    logError('You are missing some dependencies, please run:')
    log()
    log(`  npm install ${missingDeps.join(' ')} --save --save-exact`)
    log()
    process.exit()
  }
}

function logDXStartWarning() {
  logError('Don\'t use `react-project start` in production.')
  log('First add:')
  log()
  log('  rm -rf .build && react-project build && node .build/server.js')
  log()
  log('to your package.json `scripts.start` entry, then use:')
  log()
  log('  npm start\n')
}

function runDevServer(cb) {
  const { ClientConfig } = getAppWebpackConfig()
  const compiler = webpack(ClientConfig)
  const server = new WebpackDevServer(compiler, ClientConfig.devServer)
  server.listen(DEV_PORT, DEV_HOST, () => {
    log('Webpack dev server listening on port', DEV_PORT)
    cb()
  })
}

