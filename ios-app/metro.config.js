// Metro, with two folders of the web app shared as plain data: the estimator's rates and the card art.
// Only these folders are watched, so the web app's node_modules never reach the iOS bundle.
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)
const web = path.resolve(__dirname, '../src')

config.watchFolders = [path.join(web, 'components/landing'), path.join(web, 'data')]

module.exports = config
