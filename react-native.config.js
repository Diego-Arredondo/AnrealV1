// AnReal keeps the native Android sources under main/ (the layout used in the paper)
// instead of the conventional android/app/src/main. The React Native CLI looks for the
// AndroidManifest.xml inside android/app/ to auto-detect the project, so we point it at
// the real location here. (manifestPath is resolved relative to sourceDir.)
module.exports = {
  project: {
    android: {
      sourceDir: 'android',
      manifestPath: '../main/AndroidManifest.xml',
      packageName: 'com.principal',
    },
  },
};
