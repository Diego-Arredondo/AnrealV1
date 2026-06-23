// Metro configuration for Expo (bare workflow).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Los videos de la trayectoria se cargan con require('....mp4').
// 'mp4' no está en assetExts por defecto, así que lo agregamos para que
// el bundler empaquete los videos en src/media.
if (!config.resolver.assetExts.includes('mp4')) {
  config.resolver.assetExts.push('mp4');
}

module.exports = config;
