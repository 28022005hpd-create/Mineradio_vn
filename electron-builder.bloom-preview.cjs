/* Independent Windows preview: NEVER use the upstream NSIS installer.nsh,
 * which may redirect into a production Mineradio installation. */
const pkg = require('./package.json');
const clone = obj => JSON.parse(JSON.stringify(obj));
const config = clone(pkg.build);
config.appId = 'com.mineradio.bloom.lyrics.preview';
config.productName = 'Mineradio Bloom Lyrics Preview';
config.directories.output = 'dist-bloom-lyrics-preview';
config.extraMetadata = {
  name: 'mineradio-bloom-lyrics-preview',
  productName: config.productName,
  mineradio: {
    runtimeName: config.productName,
    appUserModelId: config.appId,
    update: { disabled:true, preview:true, provider:'none', mirrors:[] }
  }
};
// server.js imports this module eagerly during MR-BOOT-SERVER-START.
// Production's *-api.js glob does not match lyric-translation-service.js.
// Include it explicitly in this isolated preview (never change main installer).
config.files = clone(config.files);
if (!config.files.includes('lyric-translation-service.js')) {
  config.files.push('lyric-translation-service.js');
}
config.publish = null;
config.win.executableName = 'MineradioBloomLyricsPreview';
config.nsis = clone(config.nsis);
delete config.nsis.include;
config.nsis.allowToChangeInstallationDirectory = true;
config.nsis.oneClick = false;
config.nsis.perMachine = false;
config.nsis.shortcutName = config.productName;
config.nsis.deleteAppDataOnUninstall = false;
config.nsis.artifactName = 'Mineradio-Bloom-Lyrics-Preview-'+'$'+'{version}-Setup.'+'$'+'{ext}';
module.exports = config;
