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
  "常用": "Thông dụng",
  "界面": "Giao diện",
  "歌词": "Lời bài hát",
  "动效": "Hiệu ứng",
  "歌单架": "Danh sách phát",
  "系统": "Hệ thống",
  "先选整体风格，再进入细节调整": "Chọn phong cách tổng thể trước, sau đó tùy chỉnh chi tiết",
  "保存、应用和分享整套视觉参数": "Lưu, áp dụng và chia sẻ toàn bộ thiết lập hình ảnh",
  "恢复与整理": "Khôi phục và dọn dẹp",
  "恢复全部默认参数": "Khôi phục toàn bộ thiết lập mặc định",
  "背景强度": "Cường độ nền",
  "背景水平 位置": "Vị trí nền ngang",
  "背景垂直 位置": "Vị trí nền dọc",
  "背景放大 缩小": "Phóng to / thu nhỏ nền",
  "界面配色": "Màu giao diện",
  "界面高亮、视觉主色与图标颜色": "Điểm nhấn, màu chủ đạo và biểu tượng",
  "主题色 强调色": "Màu chủ đề, màu nhấn",
  "主页颜色": "Màu trang chủ",
  "主页图标": "Biểu tượng trang chủ",
  "控制台图标颜色": "Màu biểu tượng bảng điều khiển",
  "玻璃与左栏": "Hiệu ứng kính và thanh bên",
  "窗口玻璃质感和歌单栏唤出手感": "Hiệu ứng kính cửa sổ và thao tác mở danh sách",
  "窗口背景透明": "Độ trong suốt cửa sổ",
  "窗口透明度": "Độ trong suốt cửa sổ",
  "毛玻璃透明": "Độ trong suốt kính mờ",
  "控制台玻璃色差": "Tán sắc kính bảng điều khiển",
  "左栏雾面": "Làm mờ thanh trái",
  "左栏遮挡": "Độ che phủ thanh trái",
  "左栏唤出": "Mở thanh trái",
  "左栏收起": "Thu thanh trái",
  "显示与翻译": "Hiển thị và dịch",
  "歌词来源、行数和双语译文": "Nguồn lời, số dòng và bản dịch song ngữ",
  "原词 自定义歌词": "Lời gốc / lời tự nhập",
  "歌词行数": "Số dòng lời",
  "显示行数": "Số dòng hiển thị",
  "自定义歌词行数": "Số dòng lời tùy chỉnh",
  "双语翻译": "Dịch song ngữ",
  "译文 当前 双行 多行 关闭": "Dịch: hiện tại / hai dòng / nhiều dòng / tắt",
  "译文间距": "Khoảng cách lời dịch",
  "翻译距离": "Khoảng cách lời dịch",
  "译文字号": "Cỡ chữ lời dịch",
  "翻译大小": "Kích thước lời dịch",
  "译文透明": "Độ mờ lời dịch",
  "翻译透明度": "Độ trong lời dịch",
  "颜色与光效": "Màu sắc và ánh sáng",
  "文字、高亮、溢光和亮底可读性": "Màu chữ, điểm nhấn và độ dễ đọc trên nền sáng",
  "文字色轮": "Vòng chọn màu chữ",
  "跟唱高亮": "Tô sáng theo lời hát",
  "歌词溢光颜色": "Màu hào quang lời hát",
  "歌词溢光开关": "Bật/tắt ánh sáng lời",
  "后层溢光 跟随鼓点": "Ánh sáng nền theo nhịp",
  "歌词辉光 强度": "Cường độ phát sáng lời",
  "亮背景 可读性 自动压光": "Tự giảm sáng để dễ đọc",
  "后层辉光 开关": "Bật/tắt ánh sáng phía sau",
  "歌词辉光 跟随节拍": "Ánh sáng lời theo nhịp",
  "字体与排版": "Phông chữ và bố cục",
  "字体、字重、大小、位置和角度": "Phông, độ đậm, kích thước, vị trí và góc nghiêng",
  "文字间距": "Khoảng cách chữ",
  "歌词行间距": "Khoảng cách dòng lời",
  "粗细": "Độ đậm",
  "歌词远近 Z": "Khoảng cách lời theo trục Z",
  "歌词俯仰": "Góc nghiêng lời dọc",
  "歌词侧旋": "Góc nghiêng lời ngang",
  "滚动手感、上下文层次与故障效果": "Cuộn lời, lớp ngữ cảnh và hiệu ứng nhiễu",
  "上下文透明度": "Độ trong lời xung quanh",
  "上下文距离": "Khoảng cách lời xung quanh",
  "动画柔顺": "Độ mượt hoạt ảnh",
  "歌词边缘淡出": "Mờ dần hai mép lời",
  "歌词滚动 丝滑 缓动": "Cuộn lời mượt",
  "歌词上下浮动": "Lời nổi theo chiều dọc",
  "暂停保留歌词": "Giữ lời khi tạm dừng",
  "暂停不隐藏": "Không ẩn khi tạm dừng",
  "本地项目": "Dự án cục bộ",
  "已选择": "Đã chọn",
  "未找到 Wallpaper Engine 本体": "Không tìm thấy ứng dụng Wallpaper Engine",
  "Wallpaper Engine 运行时签名无效": "Chữ ký môi trường Wallpaper Engine không hợp lệ",
  "正在准备桌面壁纸预览…": "Đang chuẩn bị xem trước hình nền…",
  "正在用 Wallpaper Engine 原生引擎载入 Scene…": "Đang tải cảnh bằng Wallpaper Engine…",
  "Wallpaper Engine 壁纸已启用": "Đã bật hình nền Wallpaper Engine",
  "正在识别 Steam 创意工坊与本地项目…": "Đang tìm dự án Steam Workshop và dự án cục bộ…",
  "正在读取项目设置…": "Đang đọc cài đặt dự án…",
  "读取中…": "Đang tải…",
  "没有符合筛选条件的壁纸": "Không có hình nền phù hợp bộ lọc",
  "没有识别到 Wallpaper Engine 项目": "Không tìm thấy dự án Wallpaper Engine",
  "只读取 project.json 元数据，不解包大型 Scene 文件。": "Chỉ đọc metadata project.json, không giải nén các tệp Scene lớn.",
  "仅桌面版支持本地壁纸识别": "Chỉ bản máy tính hỗ trợ nhận diện hình nền cục bộ",
  "无法读取此项目的 project.json 设置。": "Không đọc được cài đặt project.json của dự án.",
  "项目设置格式无效": "Định dạng cài đặt dự án không hợp lệ",
  "项目离线": "Dự án ngoại tuyến",
  "目录移除失败": "Không thể bỏ thư mục",
  "导入目录": "Nhập thư mục",
  "读取失败": "Đọc thất bại",
  "打开失败": "Mở thất bại",
  "已恢复全部隐藏壁纸": "Đã khôi phục tất cả hình nền đã ẩn",
  "没有已隐藏的壁纸": "Không có hình nền đã ẩn",
  "壁纸媒体不可用，已恢复原背景": "Không dùng được hình nền; đã khôi phục nền cũ",
  "该项目没有可安全导入的媒体": "Dự án không có nội dung có thể nhập an toàn",
  "当前环境不支持实时窗口捕获": "Hệ thống không hỗ trợ thu hình cửa sổ thời gian thực",
  "WE 实时画面连接超时": "Kết nối hình ảnh WE hết thời gian",
  "WE 实时画面连接失败": "Kết nối hình ảnh WE thất bại",
  "WE 实时画面捕获权限被拒绝": "Quyền thu hình WE bị từ chối",
  "WE 引擎运行失败": "Không thể chạy công cụ WE",
  "正在加载 ": "Đang tải ",
  "项目设置": "Cài đặt dự án",
  "继续加载 ": "Tải thêm ",
  "暂无专辑曲目": "Chưa có bài hát trong album",
  "暂无评论": "Chưa có bình luận",
  "写下你的评论": "Viết bình luận…",
  "发送": "Gửi",
  "发送中": "Đang gửi",
  "正在载入评论...": "Đang tải bình luận…",
  "评论加载失败": "Tải bình luận thất bại",
  "评论已发布": "Đã đăng bình luận",
  "评论发布失败": "Đăng bình luận thất bại",
  "当前平台暂无评论接口": "Nền tảng hiện chưa hỗ trợ bình luận",
  "当前平台评论只读": "Chỉ xem được bình luận trên nền tảng này",
  "先输入评论内容": "Hãy nhập bình luận",
  "暂无热门歌曲": "Chưa có bài hát phổ biến",
  "未知歌手": "Chưa rõ nghệ sĩ",
  "未知专辑": "Chưa rõ album",
  "收藏专辑": "Lưu album",
  "已收藏专辑": "Đã lưu album",
  "已取消收藏专辑": "Đã bỏ lưu album",
  "专辑收藏操作失败": "Không thể lưu album",
  "无缝衔接 开": "Chuyển bài liền mạch: Bật",
  "无缝衔接 关": "Chuyển bài liền mạch: Tắt",
  "专辑无缝衔接已开启": "Đã bật chuyển bài liền mạch",
  "专辑无缝衔接已关闭": "Đã tắt chuyển bài liền mạch",
  "专辑详情": "Chi tiết album",
  "歌手详情": "Chi tiết nghệ sĩ",
  "歌曲详情": "Chi tiết bài hát",
  "正在载入专辑曲目...": "Đang tải bài hát trong album…",
  "专辑详情加载失败": "Không thể tải chi tiết album",
  "正在载入歌手主页...": "Đang tải trang nghệ sĩ…",
  "歌手主页加载失败": "Không thể tải trang nghệ sĩ",
  "收藏到歌单": "Thêm vào danh sách phát",
  "下一首播放": "Phát tiếp theo",
  "先播放或选择一首歌": "Hãy phát hoặc chọn một bài hát",
  "当前歌曲缺少歌手主页信息": "Bài hát này không có thông tin trang nghệ sĩ",
  "未知歌曲": "Bài hát chưa rõ",
  "未命名内容": "Nội dung chưa có tên",
  "本地文件": "Tệp trên máy",
  "歌曲名": "Tên bài hát",
  "时长": "Thời lượng",
  "歌词源": "Nguồn lời",
  "占位歌词": "Lời tạm",
  "原词": "Lời gốc",
  "当前歌曲": "Bài hát hiện tại",
  "红心喜欢": "Yêu thích",
  "已加入红心喜欢": "Đã thêm vào yêu thích",
  "已取消红心": "Đã bỏ yêu thích",
  "登录状态已失效，请重新登录": "Đăng nhập hết hạn, vui lòng đăng nhập lại",
  "当前平台暂不支持收藏专辑": "Nền tảng chưa hỗ trợ lưu album",
  "已切换到自定义歌词": "Đã chuyển sang lời tự nhập",
  "已切换到原歌词": "Đã chuyển về lời gốc",
  "自定义歌词已保存": "Đã lưu lời tự nhập",
  "请输入歌词内容": "Hãy nhập nội dung lời",
  "新增自定义歌词": "Thêm lời bài hát tự nhập",
  "开始听歌": "Bắt đầu nghe nhạc",
  "最近一首": "Bài gần đây nhất",
  "每日热评": "Bình luận nổi bật hôm nay",
  "我的热评": "Bình luận nổi bật",
  "每日推荐": "Gợi ý hằng ngày",
  "今日歌曲": "Bài hát hôm nay",
  "推荐歌单": "Danh sách phát đề xuất",
  "推荐读取失败": "Tải gợi ý thất bại",
  "推荐 Feed": "Nguồn gợi ý",
  "未返回推荐内容": "Chưa có nội dung gợi ý",
  "正在同步推荐内容": "Đang đồng bộ gợi ý",
  "等待你的音乐": "Đang chờ nhạc của bạn",
  "登录平台或导入本地音乐后生成推荐": "Đăng nhập hoặc nhập nhạc để nhận gợi ý",
  "展开播放器控制台": "Mở bảng điều khiển phát nhạc",
  "更换 MP4": "Đổi MP4",
  "选择 MP4": "Chọn MP4",
  "移除视频": "Xóa video",
  "主页 MP4 已保存": "Đã lưu video trang chủ",
  "主页 MP4 保存失败": "Không thể lưu video trang chủ",
  "主页 MP4 读取失败，请重新选择": "Không đọc được MP4 trang chủ; hãy chọn lại",
  "这个 MP4 无法解码，请换成 H.264 编码的 MP4": "Không giải mã được MP4; hãy dùng video H.264",
  "MP4 不能超过 300 MB": "MP4 không được quá 300 MB",
  "这里只能选择 .mp4 文件": "Chỉ chấp nhận tệp .mp4",
  "已恢复主页默认动画": "Đã khôi phục hiệu ứng trang chủ",
  "点击打开音乐库": "Nhấn để mở thư viện nhạc",
  "从音乐库或每日推荐开始": "Bắt đầu từ thư viện hoặc gợi ý hôm nay",
  "首页推荐": "Gợi ý trang chủ",
  "为你挑选": "Dành riêng cho bạn",
  "连续聆听 ": "Nghe liên tiếp ",
  "最近播放": "Đã phát gần đây",
  "点击播放": "Nhấn để phát",
  "打开音乐库": "Mở thư viện nhạc",
  "下一首": "Bài tiếp theo",
  "暂无播客内容": "Chưa có nội dung podcast",
  "正在载入": "Đang tải",
  "播客为空": "Podcast trống",
  "系统内存读取中...": "Đang đọc bộ nhớ hệ thống…",
  "歌词行数已切换": "Đã đổi số dòng lời bài hát",
  "双语翻译已切换": "Đã đổi chế độ dịch song ngữ",
  "歌词动画已切换": "Đã đổi hoạt ảnh lời bài hát",
  "无正版音源": "Không có nguồn nhạc bản quyền",
  "暂无内容": "Chưa có nội dung",
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
  "队列为空，先搜索或打开歌单": "Hàng đợi trống; hãy tìm bài hoặc mở danh sách phát",
  "队列为空，搜索后点 + 设为下一首": "Hàng đợi trống; tìm bài rồi nhấn + để phát tiếp",
  "登录后显示我的播客": "Đăng nhập để xem podcast của tôi",
  "暂无播客数据": "Chưa có dữ liệu podcast",
  "未找到歌单": "Chưa tìm thấy danh sách phát",
  "正在播放": "Đang phát",
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


  // Only explicitly localized UI, not user content or song metadata.
  const uiOwnedAttributes = Object.freeze(['title', 'placeholder', 'aria-label']);
  const dynamicAttrCache = new WeakMap();
  function bindUiAttributes(node) {
    if (!node.getAttribute || !node.setAttribute) return;
    let cache = dynamicAttrCache.get(node);
    if (!cache) { cache = Object.create(null); dynamicAttrCache.set(node, cache); }
    for (const attr of uiOwnedAttributes) {
      if (node.hasAttribute('data-i18n-' + attr)) continue;
      const current = node.getAttribute(attr);
      if (!current || !/[\u3400-\u9fff]/.test(current) &&
          !(cache[attr] && current === cache[attr].translated)) continue;
      const original = cache[attr] && current === cache[attr].translated ? cache[attr].original : current;
      const translated = ui(original);
      if (translated !== current) node.setAttribute(attr, translated);
      cache[attr] = { original, translated };
    }
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
        // Do not run translations through dynamically supplied artist / title,
        // lyric, playlist, account, and user-generated content nodes.
        if (node.hasAttribute && (node.hasAttribute('data-song-id') ||
            node.hasAttribute('data-playlist-title') || node.hasAttribute('data-podcast-title'))) return;
        if (/(?:^|\s)(?:song-name|song-artist|song-title|qi-name|qi-artist|mini-queue-name|mini-queue-sub|pl-name|pl-sub|detail-song-title|detail-artist|lyric-text|lyrics-line|user-name|track-title|track-artist)(?:\s|$)/.test(String(node.className || ''))) return;
        if (node.hasAttribute && node.hasAttribute('data-i18n') && !(node.childElementCount > 0)) return;
        bindUiAttributes(node);
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
