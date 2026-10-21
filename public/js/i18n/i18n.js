'use strict';
/**
 * Native, opt-in Mineradio locale service.
 * - Text is referenced by stable message ID (ui.xxxx), not by changing a
 *   rendered string with MutationObserver.
 * - Original zh-CN / translated vi-VN have identical IDs.
 * - UI modules may use t(id), source(text) or bind a static data-i18n key.
 * - Language changes update only registered interface labels. They do not
 *   reload the document, HTMLAudioElement, WebAudio or Three.js renderer.
 */
(function (root, factory) {
  const api = factory(root || {});
  if (root) root.MineradioI18n = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  const catalogs = root.MineradioLocales || {};
  const DEFAULT = 'zh-CN';
  const VIETNAMESE = 'vi-VN';
  const STORAGE = 'mineradio:language:v2';
  const ALLOWED = Object.freeze([DEFAULT, VIETNAMESE]);
  const sourceIndex = Object.create(null);
  const zh = catalogs[DEFAULT] || {};
  const vi = catalogs[VIETNAMESE] || {};
  for (const id of Object.keys(zh)) {
    if (!Object.prototype.hasOwnProperty.call(sourceIndex, zh[id])) sourceIndex[zh[id]] = id;
  }

  let locale = DEFAULT;
  try {
    const saved = root.localStorage && root.localStorage.getItem(STORAGE);
    const old = root.localStorage && root.localStorage.getItem('mineradio:ui-language:v1');
    locale = ALLOWED.includes(saved) ? saved : old === 'vi' ? VIETNAMESE : old === 'zh' ? DEFAULT : VIETNAMESE;
  } catch (_) { locale = VIETNAMESE; }

  const missingIds = new Set();
  const listeners = new Set();
  const staticAttrs = Object.freeze([
    ['data-i18n', 'textContent'], ['data-i18n-title', 'title'],
    ['data-i18n-placeholder', 'placeholder'], ['data-i18n-aria-label', 'aria-label'],
    ['data-i18n-alt', 'alt']
  ]);

  function interpolate(message, params) {
    if (!params || typeof params !== 'object') return message;
    return String(message).replace(/\{([a-zA-Z]\w*)\}/g, (source, name) =>
      Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : source);
  }

  function t(id, params) {
    if (typeof id !== 'string' || !id) return '';
    const current = catalogs[locale] || zh;
    const message = current[id] || zh[id];
    if (!message) {
      missingIds.add(id);
      return id;
    }
    return interpolate(message, params);
  }

  // Transitional helper for render functions with original Chinese constants.
  // UI only: NEVER feed dynamic song titles, artists, lyrics or account data here.
  function source(value, params) {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    const id = sourceIndex[value] || sourceIndex[trimmed];
    if (id) {
      const left = value.slice(0, value.indexOf(trimmed));
      const right = value.slice(value.indexOf(trimmed) + trimmed.length);
      return left + t(id, params) + right;
    }
    // A few count labels are grammatical templates rather than static IDs.
    if (locale === VIETNAMESE) {
      const match = /^(\d+)\s*(首歌曲|首|分钟|秒)$/.exec(trimmed);
      if (match) return match[1] + ' ' + ({
        '首歌曲':'bài hát', '首':'bài', '分钟':'phút', '秒':'giây'
      })[match[2]];
    }
    return value;
  }


  // Localize only known interface copy; never translate titles, artists, lyrics
  // or provider-returned account names. Dynamic components opt in explicitly.
  const dynamicUiStrings = Object.freeze({
  "正在检查更新": "Đang kiểm tra cập nhật",
  "当前版本已是最新。": "Bạn đang dùng bản mới nhất.",
  "暂时无法检查更新。": "Chưa thể kiểm tra bản cập nhật.",
  "更新检测已就绪": "Đã sẵn sàng kiểm tra cập nhật",
  "发现新版本，建议更新。": "Đã có bản mới, bạn nên cập nhật.",
  "正在打开下载页": "Đang mở trang tải xuống",
  "下载页已打开": "Đã mở trang tải xuống",
  "重试打开": "Thử mở lại",
  "当前已是最新": "Đã là bản mới nhất",
  "前往网盘下载": "Mở trang tải xuống",
  "查看更新页面": "Xem bản cập nhật",
  "正在调用系统浏览器。": "Đang mở trình duyệt.",
  "当前版本已是最新": "Bạn đang dùng bản mới nhất",
  "无法打开下载页：": "Không thể mở trang tải: ",
  "无法打开更新页面": "Không thể mở trang cập nhật",
  "前往": "Đến ",
  "请使用本次公告中的最新网盘链接，旧收藏链接可能不是最新版。软件不会在本地下载或应用补丁。": "Sử dụng liên kết tải mới trong thông báo. Ứng dụng không tự tải bản vá qua kênh này.",
  "将在浏览器打开 GitHub 更新页面；软件不会在本地下载或应用补丁。": "Trang cập nhật GitHub sẽ mở trong trình duyệt.",
  "Spotify 已连接 / ": "Spotify đã kết nối / ",
  " 缺少: ": " Thiếu: ",
  "粘贴 Spotify Client ID，并在 Spotify Developer Dashboard 登记回调地址 http://127.0.0.1:43879/callback": "Dán Spotify Client ID và đăng ký địa chỉ callback http://127.0.0.1:43879/callback trên Spotify Developer Dashboard",
  "按当前步骤继续，Mineradio 会自动检测。": "Làm theo các bước; Mineradio sẽ tự kiểm tra.",
  "Client ID 保存失败": "Không thể lưu Client ID",
  "当前不是可执行本机回调检测的 Mineradio 桌面环境。": "Môi trường hiện tại không hỗ trợ kiểm tra callback cục bộ.",
  "正在检测本机回调地址与端口…": "Đang kiểm tra cổng và địa chỉ callback…",
  "本机回调检测通过。": "Kiểm tra callback thành công.",
  "本机回调检测失败。": "Kiểm tra callback thất bại.",
  "正在验证账号资料、权限、喜欢歌曲和个人歌单…": "Đang kiểm tra tài khoản, quyền, bài thích và danh sách cá nhân…",
  "Spotify 接口已全部接通。": "Đã kết nối đầy đủ các API Spotify.",
  "仍有接口未通过。": "Vẫn còn API chưa kết nối.",
  "Spotify 接口体检失败": "Không thể kiểm tra các API Spotify",
  "获取 key 失败": "Không lấy được khóa",
  "生成二维码失败": "Tạo mã QR thất bại",
  "二维码已过期，请刷新": "Mã QR hết hạn, hãy làm mới",
  "请求较频繁，稍后自动继续检查…": "Yêu cầu quá thường xuyên; sẽ tự kiểm tra lại…",
  "当前环境不支持 Spotify 本地授权桥，请使用 Mineradio 桌面版。": "Môi trường này không hỗ trợ cấp quyền Spotify cục bộ; hãy dùng bản desktop.",
  "先完成第一步：粘贴并保存 Spotify Client ID。": "Bước 1: dán và lưu Spotify Client ID.",
  "请先保存 Spotify Client ID": "Vui lòng lưu Spotify Client ID trước",
  " / 回调地址: ": " / Callback: ",
  "Spotify 授权未完成": "Chưa hoàn tất cấp quyền Spotify",
  "授权已返回，正在验证账号资料和接口…": "Đã nhận phản hồi cấp quyền; đang xác minh tài khoản và API…",
  "Spotify 已连接: ": "Spotify đã kết nối: ",
  "Spotify 授权失败": "Cấp quyền Spotify thất bại",
  "QQ 账号态已同步，播放授权未完成": "Đã đồng bộ tài khoản QQ, chưa hoàn tất quyền phát nhạc",
  "QQ 账号已同步，播放授权不完整，部分歌曲会自动换源": "Đã đồng bộ QQ nhưng quyền phát nhạc chưa đầy đủ; một số bài sẽ tự đổi nguồn.",
  "QQ 账号已同步: ": "Đã đồng bộ QQ: ",
  "二维码已过期, 请刷新": "Mã QR đã hết hạn, hãy làm mới",
  "再次点击确认": "Nhấn lần nữa để xác nhận",
  "清理未完成，请重启后重试": "Chưa dọn dẹp xong; hãy khởi động lại và thử lại",
  "这个版本还没有可用下载页面": "Phiên bản này chưa có trang tải xuống",
  "请稍后重试": "Vui lòng thử lại sau",
  "下载线路 ": "Nguồn tải ",
  "网盘下载": "Tải qua lưu trữ đám mây",
  "登录接入": "Đăng nhập tài khoản",
  "等待扫码确认": "Đang chờ xác nhận QR",
  "等待登录确认": "Đang chờ xác nhận đăng nhập",
  "扫码登录汽水音乐": "Đăng nhập Qishui bằng QR",
  "扫码登录酷狗音乐": "Đăng nhập bằng QR KuGou Music",
  "扫码登录网易云音乐": "Đăng nhập bằng QR NetEase Cloud Music",
  "扫码登录QQ 音乐": "Đăng nhập bằng QR QQ Music",
  "扫码登录": "Đăng nhập bằng QR",
  "连接 Spotify": "Kết nối Spotify",
  "登录": "Đăng nhập",
  "正在生成二维码": "Đang tạo mã QR",
  "正在生成二维码…": "Đang tạo mã QR…",
  "刷新二维码": "Làm mới mã QR",
  "生成中…": "Đang tạo…",
  "等待扫码…": "Chờ quét mã…",
  "等待登录…": "Chờ đăng nhập…",
  "重新授权": "Cấp quyền lại",
  "同步会员": "Đồng bộ hội viên",
  "刷新状态": "Làm mới trạng thái",
  "网页登录": "Đăng nhập trên web",
  "保存 Cookie": "Lưu Cookie",
  "收起导入": "Thu gọn nhập",
  "Cookie 导入": "Nhập Cookie",
  "打开官方扫码窗口": "Mở cửa sổ quét QR chính thức",
  "打开官方登录窗口": "Mở cửa sổ đăng nhập chính thức",
  "重新打开官方窗口同步会员": "Mở lại trang chính thức để đồng bộ hội viên",
  "扫码登录汽水": "Quét QR Qishui",
  "等待账号授权": "Chờ cấp quyền tài khoản",
  "等待权限检测": "Chờ kiểm tra quyền",
  "已通过": "Đã đạt",
  "等待上一步": "Chờ bước trước",
  "检测中…": "Đang kiểm tra…",
  "进行中": "Đang thực hiện",
  "等待浏览器授权…": "Chờ cấp quyền từ trình duyệt…",
  "重新授权 Spotify": "Cấp quyền lại Spotify",
  "打开浏览器并授权": "Mở trình duyệt và cấp quyền",
  "方案未知": "Chưa rõ gói dịch vụ",
  "可同步歌单和 Liked Songs": "Có thể đồng bộ danh sách và bài hát yêu thích",
  "保存中…": "Đang lưu…",
  "等待授权…": "Chờ cấp quyền…",
  "保存并授权": "Lưu và cấp quyền",
  "等待 Spotify 授权": "Chờ cấp quyền Spotify",
  "打开 Spotify 授权": "Mở cấp quyền Spotify",
  "先保存 Client ID": "Hãy lưu Client ID trước",
  "Spotify 玩家接入三步": "3 bước kết nối Spotify",
  "打开网页，创建 App": "Mở website và tạo ứng dụng",
  "回调填": "Điền callback",
  "复制 Client ID，粘到这里": "Sao chép Client ID, dán vào đây",
  "打开网页": "Mở website",
  "复制回调": "Sao chép callback",
  "不用填": "không cần nhập",
  "已保存 Client ID；可粘贴新的 Client ID 覆盖": "Đã lưu Client ID; dán giá trị mới để thay thế",
  "请先粘贴": "Vui lòng dán",
  "等待授权": "Chờ cấp quyền",
  "已接入": "Đã kết nối",
  "共": "Tổng",
  "个接口": " nguồn",
  "待登录确认": "Chờ xác nhận đăng nhập",
  "拖入当前接口可继续添加": "Kéo nguồn hiện tại vào để thêm",
  "把左侧接口拖入这里": "Kéo kết nối từ bên trái vào đây",
  "先把左侧接口拖到 MR 接入口": "Trước tiên kéo nguồn bên trái vào MR",
  "汽水音乐仅使用官方扫码登录": "Qishui chỉ hỗ trợ quét QR chính thức",
  "Spotify 使用官方 OAuth 登录": "Spotify sử dụng OAuth chính thức",
  "已在右上角展示，点击关闭": "Đang hiển thị ở góc phải; nhấn để ẩn",
  "未在右上角展示，点击开启": "Đang ẩn ở góc phải; nhấn để hiện",
  "展示到右上角账号胶囊": "Hiện ở khu vực tài khoản góc phải",
  "展示": "Hiện",
  "等待接入": "Chờ kết nối",
  "网易云音乐": "NetEase Cloud Music",
  "网易云": "NetEase",
  "QQ 音乐": "QQ Music",
  "酷狗音乐": "KuGou Music",
  "酷狗": "KuGou",
  "汽水音乐": "Qishui Music",
  "汽水": "Qishui",
  "普通用户": "Tài khoản thường",
  "会员待同步": "Đang đồng bộ hội viên",
  "会员": "Hội viên",
  "会话": "Phiên đăng nhập",
  "未登录": "Chưa đăng nhập",
  "已扫码登录": "Đã đăng nhập bằng QR",
  "可同步我的喜欢、歌单并按账号权益播放": "Có thể đồng bộ yêu thích, danh sách và phát theo quyền tài khoản",
  "请使用抖音 App 扫码": "Quét QR bằng ứng dụng Douyin",
  "请使用抖音 App 扫码并确认登录": "Quét mã bằng Douyin và xác nhận đăng nhập",
  "点击“登录”打开酷狗音乐官方窗口": "Nhấn Đăng nhập để mở cửa sổ KuGou",
  "点击“网页登录”打开网易云官方窗口": "Nhấn Đăng nhập web để mở NetEase",
  "从 kugou.com 的登录会话导入。": "Nhập phiên đăng nhập từ kugou.com.",
  "从 music.163.com 的登录会话导入。": "Nhập phiên đăng nhập từ music.163.com.",
  "从 y.qq.com 的登录会话导入。": "Nhập phiên đăng nhập từ y.qq.com.",
  "查看": "Xem",
  "补登": "Thêm đăng nhập",
  "重新登录": "Đăng nhập lại",
  "退出登录": "Đăng xuất",
  "退出": "Đăng xuất",
  "清除汽水登录态": "Xóa phiên Qishui",
  "右上角已切换为多平台并排展示。": "Nhiều tài khoản đang được hiển thị cạnh nhau.",
  "可切换右上角展示的平台；“我两个都要”会并排显示当前已登录的平台。": "Chọn nền tảng hiển thị ở góc phải; chế độ nhiều tài khoản sẽ hiển thị các tài khoản đã đăng nhập.",
  "已退出全部账号，登录彩蛋已重新开启": "Đã đăng xuất tất cả tài khoản",
  "正在清除…": "Đang xóa…",
  "是否导出": "Xuất",
  "登录 cookie 到桌面？": "cookie đăng nhập ra màn hình nền?",
  "文件名会保存为": "Tệp sẽ được lưu tên",
  "用于备份当前平台登录态。": "để sao lưu phiên đăng nhập hiện tại.",
  "桌面版才支持导出登录 cookie": "Chỉ bản desktop hỗ trợ xuất cookie",
  "登录 cookie 已导出到桌面": "Đã xuất cookie ra màn hình nền",
  "没有可导出的登录 cookie": "Không có cookie để xuất",
  "导出登录 cookie 失败": "Không thể xuất cookie",
  "打开": "Mở",
  "官方": "chính thức",
  "窗口": "cửa sổ",
  "扫码": "Quét QR",
  "成功后会自动同步账号会话。": "Đăng nhập thành công sẽ tự đồng bộ phiên tài khoản.",
  "登录后可同步": "Sau khi đăng nhập có thể đồng bộ",
  "当前环境不支持桌面授权桥": "Môi trường này không hỗ trợ cấp quyền desktop",
  "正在保存并验证 Client ID…": "Đang lưu và xác minh Client ID…",
  "已复制 Spotify 回调地址": "Đã sao chép địa chỉ callback Spotify"
});
  const dynamicUiPairs = Object.keys(dynamicUiStrings)
    .filter(key => key.length >= 3 && /[\u3400-\u9fff]/.test(key))
    .sort((a, b) => b.length - a.length);
  const dynamicTextCache = new WeakMap();

  function ui(value) {
    if (typeof value !== 'string' || locale !== VIETNAMESE) return value;
    const trimmed = value.trim();
    if (Object.prototype.hasOwnProperty.call(dynamicUiStrings, trimmed)) {
      const start = value.indexOf(trimmed);
      return value.slice(0, start) + dynamicUiStrings[trimmed] + value.slice(start + trimmed.length);
    }
    const staticValue = source(value);
    if (staticValue !== value) return staticValue;
    if (!/[\u3400-\u9fff]/.test(value)) return value;
    let translated = value;
    for (const original of dynamicUiPairs) {
      if (translated.includes(original)) translated = translated.split(original).join(dynamicUiStrings[original]);
    }
    return translated;
  }

  function bindDynamicUi(rootNode) {
    if (!rootNode) return;
    const excluded = /^(SCRIPT|STYLE|TEXTAREA|INPUT|CODE|OPTION)$/;
    const excludedIds = new Set(['user-modal-name','user-modal-avatar','qq-cookie-input','login-easter-egg-input']);
    function walk(node) {
      if (node.nodeType === 3) {
        const current = String(node.nodeValue || '');
        if (!current.trim()) return;
        const last = dynamicTextCache.get(node);
        const original = last && current === last.translated ? last.original : current;
        const translated = ui(original);
        if (current !== translated) node.nodeValue = translated;
        dynamicTextCache.set(node, { original, translated });
        return;
      }
      if (node.nodeType !== 1 && node.nodeType !== 9 && node.nodeType !== 11) return;
      if (node.nodeType === 1) {
        if (excluded.test(String(node.nodeName || '').toUpperCase()) || excludedIds.has(node.id || '')) return;
        if (node.hasAttribute && node.hasAttribute('data-i18n')) return;
        if (node.hasAttribute && node.hasAttribute('data-song-id')) return;
      }
      for (const child of Array.from(node.childNodes || [])) walk(child);
    }
    walk(rootNode);
  }

  function bind(rootNode) {
    const doc = root.document;
    if (!doc || !rootNode) return;
    let elements = [];
    if (rootNode.nodeType === 1 && rootNode.hasAttribute &&
        staticAttrs.some(([attr]) => rootNode.hasAttribute(attr))) elements.push(rootNode);
    if (typeof rootNode.querySelectorAll === 'function') {
      elements = elements.concat(Array.from(rootNode.querySelectorAll(
        '[data-i18n],[data-i18n-title],[data-i18n-placeholder],[data-i18n-aria-label],[data-i18n-alt]'
      )));
    }
    for (const element of elements) {
      for (const [keyAttr, property] of staticAttrs) {
        const key = element.getAttribute(keyAttr);
        if (!key) continue;
        const value = t(key);
        if (value === key) continue;
        if (property === 'textContent') {
          // Never destroy event handlers or nested markup: only leaf labels
          // are keyed in the original templates.
          if (element.childElementCount === 0 && element.textContent !== value) {
            element.textContent = value;
          }
        } else if (element.getAttribute(property) !== value) {
          element.setAttribute(property, value);
        }
      }
    }
  }

  function setLanguage(next) {
    if (!ALLOWED.includes(next)) return locale;
    if (locale === next) return locale;
    locale = next;
    try { root.localStorage && root.localStorage.setItem(STORAGE, locale); } catch (_) {}
    // Electron owns the native tray preference; no network and no page reload.
    if (root.desktopWindow && typeof root.desktopWindow.setUiLanguage === 'function') {
      Promise.resolve(root.desktopWindow.setUiLanguage(locale)).catch(() => {});
    }
    const doc = root.document;
    if (doc) {
      doc.documentElement.lang = locale;
      bind(doc);
      const picker = doc.getElementById && doc.getElementById('mineradio-language-select');
      if (picker) picker.value = locale;
    }
    for (const callback of Array.from(listeners)) {
      try { callback(locale); } catch (_) { /* one consumer cannot break audio */ }
    }
    if (root.dispatchEvent && root.CustomEvent) {
      root.dispatchEvent(new root.CustomEvent('mineradio:languagechange', { detail: { locale } }));
    }
    return locale;
  }

  function onChange(callback) {
    if (typeof callback !== 'function') return () => {};
    listeners.add(callback);
    return () => listeners.delete(callback);
  }

  function init() {
    const doc = root.document;
    if (!doc) return;
    if (root.desktopWindow) {
      if (typeof root.desktopWindow.onUiLanguageChanged === 'function') {
        root.desktopWindow.onUiLanguageChanged((next) => setLanguage(next));
      }
      if (typeof root.desktopWindow.getUiLanguage === 'function') {
        const initially = locale;
        const hasLocalChoice = (() => {
          try {
            return !!(root.localStorage && (
              root.localStorage.getItem(STORAGE) ||
              root.localStorage.getItem('mineradio:ui-language:v1')
            ));
          } catch (_) { return false; }
        })();
        Promise.resolve(root.desktopWindow.getUiLanguage()).then((result) => {
          if (locale !== initially) return; // user switched during async startup
          if (hasLocalChoice && typeof root.desktopWindow.setUiLanguage === 'function') {
            // Migrate explicit renderer choice to the shared native tray preference.
            return root.desktopWindow.setUiLanguage(locale);
          }
          if (result && ALLOWED.includes(result.locale)) setLanguage(result.locale);
        }).catch(() => {});
      }
    }
    doc.documentElement.lang = locale;
    const picker = doc.getElementById && doc.getElementById('mineradio-language-select');
    if (picker) picker.value = locale;
    bind(doc);
  }

  const api = Object.freeze({
    locales: ALLOWED,
    get locale() { return locale; },
    t, source, ui, bind, bindDynamicUi, setLanguage, onChange,
    getMissingKeys: () => Array.from(missingIds).sort(),
    has: id => Object.prototype.hasOwnProperty.call(zh, id) &&
      Object.prototype.hasOwnProperty.call(vi, id)
  });
  if (root.document) {
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', init, { once: true });
    } else init();
  }
  return api;
});
