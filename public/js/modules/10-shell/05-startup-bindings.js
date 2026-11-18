// Built-in locale updates only owned UI controls; playback and GPU state are untouched.
if (typeof MineradioI18n !== 'undefined' && MineradioI18n.onChange) {
  MineradioI18n.onChange(function () {
    if (typeof updateSearchModeTabs === 'function') updateSearchModeTabs();
    if (typeof updateDevelopmentFxControls === 'function') updateDevelopmentFxControls();
    if (typeof renderHomeDiscover === 'function') renderHomeDiscover();
  });
}
applyDiyMode(diyPlayerMode, { save: false });
bindFxPanel();
applySavedLyricPaletteState();
bindQualityControl();
bindAudioOutputControls();
bindVolumeControls();
initControlGlassSurface();
if (typeof initializeMineradioLiveMv === 'function') initializeMineradioLiveMv();
bindPlayerControlAnimations();
scheduleUiWarmTask(function () {
  updateControlGlassDisplacementMap();
  updateSearchBoxGlassDisplacementMap();
  updateSearchPillGlassDisplacementMap();
  try {
    if (renderer && renderer.compile && scene && camera) renderer.compile(scene, camera);
  } catch (e) { }
}, 900);
applyUserCapsuleAutoHideState();
applyFxFabAutoHideState();
initializeDesktopCloseBehavior();
applyStartupAutoplayUi();
applyControlsAutoHidePreference();
applyDesktopLyricsState(false);
applyWallpaperModeState(false);
setShelfMode(fx.shelf);
if (fx.shelf === 'side') setShelfPinnedOpen(!!fx.shelfPinnedOpen, true, false);
var restoredPlaybackAtStartup = restoreLastPlaybackSnapshot();
var persistedLocalLibraryRestorePromise = Promise.resolve(restorePersistedLocalLibrary()).then(function (restored) {
  if (restored) restoredPlaybackAtStartup = true;
  else if (!restoredLastPlaybackSnapshot) restoredPlaybackAtStartup = false;
  return restored;
}, function () { return false; });
var builtInPlaylistRestorePromise = typeof refreshBuiltInPlaylists === 'function'
  ? Promise.resolve(refreshBuiltInPlaylists(false))
  : Promise.resolve(false);
applyStartupStarfieldPreset();
switchPlaylistTab(queueViewTab, { save: false, animate: false, refresh: false });
applyPlaylistPanelPinState(false);
if (fx.floatLayer) createFloatLayer();
if (fx.particleLyrics) createLyricsParticles();
if (fx.backCover) createBackCoverLayer();
initIdleGuideCanvas();
var startupLoginStatusPromise = Promise.all([refreshLoginStatus(), refreshQQLoginStatus({ forceVip: true, reason: 'startup' }), refreshKugouLoginStatus(), refreshQishuiLoginStatus(), persistedLocalLibraryRestorePromise, builtInPlaylistRestorePromise]);
startQQLoginStatusAutoRefresh();
startKugouLoginStatusAutoRefresh();
startQishuiLoginStatusAutoRefresh();
if (typeof setupFullscreenDiyLayoutTracking === 'function') setupFullscreenDiyLayoutTracking();
if (startupLoginStatusPromise && startupLoginStatusPromise.then) {
  startupLoginStatusPromise.then(function () {
    if (hasAnyPlatformLogin()) {
      refreshUserPlaylists(true);
      loadHomeDiscover(true);
    }
    if (restoredPlaybackAtStartup) queueStartupAutoplayAfterHomeReveal('login-status');
    if (document.body.classList.contains('splash-active')) return;
    var homeShown = updateEmptyHomeVisibility({ forceLoad: hasAnyPlatformLogin() });
    if (!hasAnyPlatformLogin()) maybeRunStartupLoginGuide('status');
    else if (!homeShown) maybeRunStartupLoginGuide('status');
  }, function () {
    if (restoredPlaybackAtStartup) queueStartupAutoplayAfterHomeReveal('login-status');
  });
} else if (restoredPlaybackAtStartup) {
  queueStartupAutoplayAfterHomeReveal('startup');
}
var collectNameInput = document.getElementById('collect-new-name');
if (collectNameInput) {
  collectNameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      createPlaylistFromCollect();
    }
  });
}
var customLyricInput = document.getElementById('custom-lyric-input');
if (customLyricInput) {
  customLyricInput.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      saveCustomLyricForCurrent();
    }
  });
}
safeRenderQueuePanel('startup');
if (!restoredPlaybackAtStartup) {
  restoredPlaybackAtStartup = restoreLastPlaybackSnapshot();
  if (restoredPlaybackAtStartup) queueStartupAutoplayAfterHomeReveal('startup-restore');
}
safeRenderQueuePanel('startup-restore');
updateCustomCoverButton();
updateCustomLyricControls();
updateLikeButtons();
setTimeout(initUpdatePreview, 9000);
initVnGithubUpdatePanel();
if (typeof MineradioI18n !== 'undefined' && MineradioI18n.bindDynamicUi) {
  function refreshLocalizedDynamicPanels() {
    ['login-modal','user-modal','update-modal'].forEach(function (id) {
      MineradioI18n.bindDynamicUi(document.getElementById(id));
    });
  }
  refreshLocalizedDynamicPanels();
  MineradioI18n.onChange(refreshLocalizedDynamicPanels);
}
window.addEventListener('beforeunload', function () {
  saveLastPlaybackSnapshot(true, 'beforeunload');
});

// ============================================================
//  主循环


// Only refresh discrete application panels after their existing render functions
// finish. No MutationObserver, document-wide translation or audio/GPU hooks.
if (typeof MineradioI18n !== 'undefined' && MineradioI18n.bindDynamicUi) {
  function afterLocalizedUiRender(original, targetId) {
    return function () {
      var result = original.apply(this, arguments);
      function apply() {
        var target = document.getElementById(targetId);
        if (target) {
          MineradioI18n.bindDynamicUi(target);
          MineradioI18n.scheduleLayoutAudit(target);
        }
      }
      if (result && typeof result.then === 'function') {
        return result.then(function (value) { apply(); return value; });
      }
      apply();
      return result;
    };
  }
  // The visual console builds its categories dynamically, and presets/archives
  // replace their HTML on each interaction. Localize only after those renders,
  // never on each WebGL frame or slider input.
  if (typeof renderUserFxArchives === 'function')
    renderUserFxArchives = afterLocalizedUiRender(renderUserFxArchives, 'fx-panel');
  if (typeof buildPresetGrid === 'function')
    buildPresetGrid = afterLocalizedUiRender(buildPresetGrid, 'fx-panel');
  if (typeof refreshPresetGrid === 'function')
    refreshPresetGrid = afterLocalizedUiRender(refreshPresetGrid, 'fx-panel');
  if (typeof organizeFxConsoleWorkspace === 'function')
    organizeFxConsoleWorkspace = afterLocalizedUiRender(organizeFxConsoleWorkspace, 'fx-panel');
  if (typeof relabelFxPanelControls === 'function')
    relabelFxPanelControls = afterLocalizedUiRender(relabelFxPanelControls, 'fx-panel');
  // Existing startup initialization precedes the render wrappers.
  // Sweep once now to translate its initial dynamically created labels.
  var initialFxPanel = document.getElementById('fx-panel');
  if (initialFxPanel) {
    MineradioI18n.bind(initialFxPanel);
    MineradioI18n.bindDynamicUi(initialFxPanel);
    MineradioI18n.scheduleLayoutAudit(initialFxPanel);
  }

  // Account login updates asynchronously after QR generation, phone scanning,
  // expiry, and official web authorization. Refresh only its modal, never the
  // song titles/artist names in the surrounding player.
  if (typeof refreshQr === 'function')
    refreshQr = afterLocalizedUiRender(refreshQr, 'login-modal');
  if (typeof pollQishuiQr === 'function')
    pollQishuiQr = afterLocalizedUiRender(pollQishuiQr, 'login-modal');
  if (typeof checkQr === 'function')
    checkQr = afterLocalizedUiRender(checkQr, 'login-modal');
  if (typeof openNeteaseWebLogin === 'function')
    openNeteaseWebLogin = afterLocalizedUiRender(openNeteaseWebLogin, 'login-modal');
  if (typeof openQQWebLogin === 'function')
    openQQWebLogin = afterLocalizedUiRender(openQQWebLogin, 'login-modal');
  if (typeof openKugouWebLogin === 'function')
    openKugouWebLogin = afterLocalizedUiRender(openKugouWebLogin, 'login-modal');
  if (typeof submitQQCookieLogin === 'function')
    submitQQCookieLogin = afterLocalizedUiRender(submitQQCookieLogin, 'login-modal');
  if (typeof submitNeteaseCookieLogin === 'function')
    submitNeteaseCookieLogin = afterLocalizedUiRender(submitNeteaseCookieLogin, 'login-modal');
  if (typeof updateUserModalUi === 'function')
    updateUserModalUi = afterLocalizedUiRender(updateUserModalUi, 'user-modal');
  if (typeof refreshMineradioCacheSettings === 'function')
    refreshMineradioCacheSettings = afterLocalizedUiRender(refreshMineradioCacheSettings, 'fx-panel');
  if (typeof refreshMemorySnapshot === 'function')
    refreshMemorySnapshot = afterLocalizedUiRender(refreshMemorySnapshot, 'fx-panel');
  if (typeof updateMemoryControls === 'function')
    updateMemoryControls = afterLocalizedUiRender(updateMemoryControls, 'fx-panel');

  // Login contents are frequently replaced by polling and provider switching.
  // Translate only the known UI-owned modal, never track or account metadata.
  if (typeof updateLoginProviderUi === 'function')
    updateLoginProviderUi = afterLocalizedUiRender(updateLoginProviderUi, 'login-modal');
  if (typeof renderLoginModal === 'function')
    renderLoginModal = afterLocalizedUiRender(renderLoginModal, 'login-modal');
  if (typeof renderUserModal === 'function')
    renderUserModal = afterLocalizedUiRender(renderUserModal, 'user-modal');
  if (typeof renderUserBtn === 'function')
    renderUserBtn = afterLocalizedUiRender(renderUserBtn, 'user-modal');
  if (typeof renderFxConsoleSearchResults === 'function')
    renderFxConsoleSearchResults = afterLocalizedUiRender(renderFxConsoleSearchResults, 'fx-panel');
  if (typeof renderFxConsoleHistory === 'function')
    renderFxConsoleHistory = afterLocalizedUiRender(renderFxConsoleHistory, 'fx-panel');
  if (typeof renderWallpaperEngineLibrary === 'function')
    renderWallpaperEngineLibrary = afterLocalizedUiRender(renderWallpaperEngineLibrary, 'wallpaper-engine-modal');
  if (typeof renderWallpaperEngineProjectDetails === 'function')
    renderWallpaperEngineProjectDetails = afterLocalizedUiRender(renderWallpaperEngineProjectDetails, 'wallpaper-engine-modal');
  if (typeof updateWallpaperEngineLibraryStatus === 'function')
    updateWallpaperEngineLibraryStatus = afterLocalizedUiRender(updateWallpaperEngineLibraryStatus, 'wallpaper-engine-modal');
  if (typeof renderDetailComments === 'function')
    renderDetailComments = afterLocalizedUiRender(renderDetailComments, 'track-detail-modal');
  if (typeof renderAlbumSongList === 'function')
    renderAlbumSongList = afterLocalizedUiRender(renderAlbumSongList, 'track-detail-modal');
  if (typeof renderArtistSongList === 'function')
    renderArtistSongList = afterLocalizedUiRender(renderArtistSongList, 'track-detail-modal');
  if (typeof renderHomeDashboard === 'function')
    renderHomeDashboard = afterLocalizedUiRender(renderHomeDashboard, 'home-dashboard');
  if (typeof renderHomePlatformRecommendations === 'function')
    renderHomePlatformRecommendations = afterLocalizedUiRender(renderHomePlatformRecommendations, 'home-platform-recommend-modal');
  MineradioI18n.onChange(function () {
    ['fx-panel', 'wallpaper-engine-modal', 'track-detail-modal', 'home-dashboard',
      'home-platform-recommend-modal', 'local-beat-modal', 'custom-lyric-modal',
      'source-fallback-modal'].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) {
        MineradioI18n.bindDynamicUi(node);
        MineradioI18n.scheduleLayoutAudit(node);
      }
    });
  });
}
