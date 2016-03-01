import { logTask, logError } from './LogUtils'
import build from './build'
import start from './start'

const action = process.argv[2]

const actions = {
  start,
  build
}

if (actions[action]) {
  logTask(`[${action}]`, 'task')
  actions[action](() => {
    logTask(`[${action}]`, 'task complete')
  })
} else {
  logError(action, 'is not a valid command')
}

