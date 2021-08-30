const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
// const { useBabelRc, override, useEslintRc } = require('customize-cra')
const path = require('path')
module.exports = function override(config, env) {
    config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));
    config.resolve.alias = {
        "@" :path.resolve(__dirname, 'src/')
    }
    config.output.filename = 'build.js'
    // useBabelRc()
    return config;
};