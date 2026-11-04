// Expo's flat config. Kept here so ESLint never falls back to the web app's config one folder up.
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([expoConfig, { ignores: ['dist/*', '.expo/*'] }])
