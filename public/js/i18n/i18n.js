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
  "当前不是桌面版，系统内存优化不可用": "Không thể tối ưu RAM hệ thống ngoài bản desktop",
  "系统内存读取失败": "Không thể đọc RAM hệ thống",
  "系统内存读取失败: ": "Lỗi đọc RAM hệ thống: ",
  "Mem Reduct 配置失败: ": "Không thể cấu hình Mem Reduct: ",
  "桌面版才支持进程内存压缩": "Chỉ bản desktop hỗ trợ giảm RAM tiến trình",
  "正在压缩播放器工作集...": "Đang giảm bộ nhớ tiến trình Mineradio…",
  "播放器已压缩: ": "Đã giảm RAM Mineradio: ",
  "前台可见时不压缩，避免操作卡顿；最小化/隐藏后自动处理": "Không giảm RAM khi cửa sổ đang hiện để tránh giật; sẽ tự xử lý sau khi thu nhỏ hoặc ẩn",
  "播放器压缩未完成": "Chưa giảm được RAM Mineradio",
  "播放器压缩失败: ": "Lỗi giảm RAM Mineradio: ",
  "桌面版才支持系统级释放": "Chỉ bản desktop hỗ trợ giải phóng RAM hệ thống",
  "正在请求提权系统释放（前台可见时会跳过）...": "Đang xin quyền quản trị để giải phóng RAM (bỏ qua khi cửa sổ đang hiện)…",
  "正在尝试系统级手动释放（前台可见时会跳过）...": "Đang thử giải phóng RAM hệ thống (bỏ qua khi cửa sổ đang hiện)…",
  "前台可见时不执行系统释放；先最小化/隐藏再用，避免操作卡顿": "Hãy thu nhỏ/ẩn Mineradio trước khi giải phóng RAM hệ thống để tránh giật",
  "前台已跳过系统释放，最小化后再用": "Đã bỏ qua giải phóng RAM khi cửa sổ đang hiện; hãy thu nhỏ rồi thử lại",
  "系统释放完成，约释放 ": "Đã giải phóng RAM hệ thống, khoảng ",
  "系统释放完成": "Đã giải phóng RAM hệ thống",
  "（部分权限）": " (quyền hạn chế)",
  "提权释放未完成：可能取消了管理员权限或被系统拦截": "Không thể giải phóng RAM với quyền quản trị; có thể bị từ chối hoặc hủy",
  "当前权限只能完成部分释放；需要时可最小化后点提权释放": "Quyền hiện tại chỉ giải phóng một phần; thu nhỏ ứng dụng rồi thử yêu cầu quyền quản trị",
  "提权释放未完成": "Chưa giải phóng RAM bằng quyền quản trị",
  "需要管理员权限的部分已跳过": "Đã bỏ qua phần cần quyền quản trị",
  "系统释放未完成: ": "Chưa giải phóng xong RAM: ",
  "系统释放失败: ": "Lỗi giải phóng RAM hệ thống: ",
  "保存失败": "Không thể lưu",
  "缓存设置不可用：": "Thiết lập bộ đệm không khả dụng: ",
  "缓存设置不可用": "Không thể truy cập thiết lập bộ đệm",
  "已占用 ": "Đã sử dụng ",
  "系统安全数据目录": "Thư mục dữ liệu hệ thống an toàn",
  "歌词缓存已切换；封面、网络、音频分片、节奏分析与 WE 静音场景将在重启后改用新目录。": "Đã chuyển bộ đệm lời hát. Bìa, mạng, âm thanh, phân tích nhịp và cảnh WE sẽ dùng thư mục mới sau khi khởi động lại.",
  "歌词缓存立即生效；封面、网络、音频分片、节奏分析与 WE 静音场景已使用此目录。": "Bộ đệm lời hát có hiệu lực ngay. Bìa, mạng, âm thanh, nhịp và cảnh WE hiện dùng thư mục này.",
  "仅桌面版支持本地缓存路径设置": "Chỉ bản desktop hỗ trợ đổi thư mục bộ đệm",
  "正在统计...": "Đang thống kê…",
  "歌词颜色: ": "Màu lời bài hát: ",
  "高亮颜色: ": "Màu tô sáng: ",
  "溢光颜色: ": "Màu hào quang: ",
  "界面高亮: ": "Màu nhấn giao diện: ",
  "视觉主色: ": "Màu chủ đạo hình ảnh: ",
  "Home 填充: ": "Màu trang chủ: ",
  "主页图标: ": "Màu biểu tượng trang chủ: ",
  "视觉图标: ": "Màu biểu tượng hình ảnh: ",
  "背景颜色: ": "Màu nền: ",
  "歌单架颜色: ": "Màu giá danh sách phát: ",
  "桌面歌词帧数 ": "FPS lời desktop: ",
  "桌面歌词帧数无上限": "FPS lời desktop: không giới hạn",
  "壁纸帧数 ": "FPS hình nền: ",
  "当前系统不支持桌面壁纸模式": "Máy tính không hỗ trợ chế độ hình nền desktop",
  "完整桌面模式已开启 · ": "Đã bật desktop toàn màn hình · ",
  "完整桌面模式已关闭": "Đã tắt desktop toàn màn hình",
  "完整桌面模式启动失败：": "Không thể bật desktop toàn màn hình: ",
  "完整桌面模式关闭失败：": "Không thể tắt desktop toàn màn hình: ",
  "开发中，暂不可用": "Tính năng đang phát triển, chưa khả dụng",
  "背景星河已开启": "Đã bật hiệu ứng ngân hà nền",
  "背景星河已关闭": "Đã tắt hiệu ứng ngân hà nền",
  "歌词溢光已开启": "Đã bật hào quang lời hát",
  "歌词溢光已关闭": "Đã tắt hào quang lời hát",
  "歌词溢光跟随鼓点": "Hào quang lời hát theo nhịp trống",
  "歌词溢光已脱离鼓点": "Hào quang lời hát không theo nhịp trống",
  "歌词光粒已开启": "Đã bật hạt sáng lời hát",
  "歌词光粒已关闭": "Đã tắt hạt sáng lời hát",
  "歌词上下浮动已开启": "Đã bật lời hát trôi dọc",
  "歌词上下浮动已关闭": "Đã tắt lời hát trôi dọc",
  "歌词实时边界已开启": "Đã bật căn chỉnh lời hát theo khung hình",
  "歌词实时边界已关闭，已停止逐帧投影": "Đã tắt căn chỉnh lời hát theo khung hình",
  "上下句高清纹理已开启": "Đã bật lời trước/sau độ nét cao",
  "上下句高清纹理已关闭，仅保留当前双语高清": "Đã tắt nét cao lời trước/sau, giữ nét cao lời song ngữ hiện tại",
  "全局歌词避光已开启": "Đã bật tự điều chỉnh lời trên nền sáng",
  "全局歌词避光已关闭": "Đã tắt tự điều chỉnh lời trên nền sáng",
  "封面粒子避光已开启": "Đã bật tự điều chỉnh hạt bìa trên nền sáng",
  "封面粒子避光已关闭": "Đã tắt tự điều chỉnh hạt bìa trên nền sáng",
  "暂停时保留歌词": "Tạm dừng nhưng vẫn giữ lời hát",
  "暂停时隐藏歌词": "Ẩn lời hát khi tạm dừng",
  "桌面歌词已开启": "Đã bật lời trên desktop",
  "桌面歌词已关闭": "Đã tắt lời trên desktop",
  "桌面歌词已锁定": "Đã khóa vị trí lời desktop",
  "桌面歌词可移动": "Có thể kéo lời desktop",
  "桌面歌词电影震动已开启": "Đã bật rung điện ảnh cho lời desktop",
  "桌面歌词电影震动已关闭，基础漂浮保留": "Đã tắt rung điện ảnh, giữ hiệu ứng trôi nhẹ",
  "桌面歌词高亮跟随已开启": "Đã bật tô sáng lời desktop theo nhạc",
  "桌面歌词高亮跟随已关闭": "Đã tắt tô sáng lời desktop theo nhạc",
  "壁纸模式已开启": "Đã bật chế độ hình nền",
  "壁纸模式已关闭": "Đã tắt chế độ hình nền",
  "3D歌单架已显示播客歌单": "Giá nhạc 3D đang hiển thị danh sách podcast",
  "3D歌单架已隐藏播客歌单": "Giá nhạc 3D đã ẩn danh sách podcast",
  "我的歌单与收藏歌单已合并滚动": "Đã gộp danh sách của tôi và đã lưu để cuộn chung",
  "收藏歌单恢复滚到底切页": "Danh sách đã lưu quay về chuyển trang ở cuối",
  "直播后台保持已开启": "Đã bật duy trì luồng trực tiếp khi chạy nền",
  "直播后台保持已关闭": "Đã tắt duy trì luồng trực tiếp khi chạy nền",
  "播放器进程压缩已开启": "Đã bật tối ưu RAM tiến trình nhạc",
  "播放器进程压缩已关闭": "Đã tắt tối ưu RAM tiến trình nhạc",
  "最小化后台会自动压缩": "Tự giảm RAM khi ứng dụng thu nhỏ",
  "后台自动压缩已关闭": "Đã tắt tự giảm RAM khi chạy nền",
  "系统级 Mem Reduct 已开启": "Đã bật Mem Reduct cấp hệ thống",
  "系统级 Mem Reduct 已关闭": "Đã tắt Mem Reduct cấp hệ thống",
  "系统释放允许请求管理员权限": "Cho phép hỏi quyền quản trị khi giải phóng RAM hệ thống",
  "系统释放不再自动提权": "Không tự yêu cầu quyền quản trị khi giải phóng RAM",
  "歌词已绑定镜头": "Đã ghim lời hát theo góc máy",
  "歌词已恢复自由漂浮": "Đã cho phép lời hát trôi tự do",
  "溢光已开启": "Đã bật ánh sáng lan",
  "溢光已关闭": "Đã tắt ánh sáng lan",
  "已开启轮廓高亮": "Đã bật tô sáng đường viền",
  "已关闭轮廓高亮": "Đã tắt tô sáng đường viền",
  "已开启电影镜头": "Đã bật góc máy điện ảnh",
  "已关闭电影镜头": "Đã tắt góc máy điện ảnh",
  "已开启后台 AI 立体增强": "Đã bật tăng chiều sâu bằng AI khi chạy nền",
  "已关闭 AI 立体增强, 使用轻量弧面": "Đã tắt tăng chiều sâu AI, dùng hiệu ứng nhẹ",
  "开启 DIY 玩家模式后可打开视觉控制台": "Hãy bật chế độ DIY để mở bảng điều khiển hình ảnh",
  "已恢复默认参数": "Đã khôi phục thiết lập mặc định",
  "3D歌单架: 静态镜头": "Giá nhạc 3D: góc máy cố định",
  "3D歌单架: 动态镜头": "Giá nhạc 3D: góc máy chuyển động",
  "3D歌单架: 常驻": "Giá nhạc 3D: luôn hiển thị",
  "3D歌单架: 自动隐藏": "Giá nhạc 3D: tự động ẩn",
  "已退出全沉浸式": "Đã thoát chế độ toàn cảnh",
  "歌词清晰度: ": "Độ rõ lời hát: ",
  "后台策略: 保持运行": "Chạy nền: tiếp tục hoạt động",
  "后台策略: 停止并释放": "Chạy nền: dừng và giải phóng bộ nhớ",
  "后台策略: 自动优化": "Chạy nền: tối ưu tự động",
  "画质档位: ": "Chất lượng hình ảnh: ",
  "前台帧率: 跟随屏幕垂直同步": "FPS khi mở cửa sổ: đồng bộ theo màn hình",
  "前台帧率上限: ": "Giới hạn FPS khi mở cửa sổ: ",
  "4× 极致": "4× tối đa",
  "3× 超清": "3× siêu nét",
  "2× 高清": "2× sắc nét",
  "1× 标清": "1× tiêu chuẩn",
  "低": "Thấp",
  "中": "Trung bình",
  "高": "Cao",
  "超高": "Rất cao",
  "界面与背景": "Giao diện và hình nền",
  "壁纸帧率": "Tốc độ khung hình nền",
  "玻璃色差": "Tán sắc kính",
  "左栏唤出秒数": "Thời gian mở thanh trái (giây)",
  "左栏收起秒数": "Thời gian thu thanh trái (giây)",
  "没有找到": "Không tìm thấy",
  "当前会话 · 最多 40 条": "Phiên hiện tại · tối đa 40 thao tác",
  "调整设置后会在这里留下可回退记录": "Các thay đổi có thể hoàn tác sẽ xuất hiện tại đây",
  "撤销至此项前": "Hoàn tác về trước mục này",
  "开启": "Bật",
  "关闭": "Tắt",
  "无": "Không có",
  " 项参数": " thiết lập",
  "视觉设置": "Thiết lập hình ảnh",
  "已回退：": "Đã hoàn tác: ",
  "回退失败，请重试": "Không thể hoàn tác, hãy thử lại",
  // Authored Vietnamese copy for visual console, presets and archived settings.
  "颜色、封面、图片、视频与 Wallpaper Engine": "Màu sắc, ảnh bìa, hình ảnh, video và Wallpaper Engine",
  "桌面层开关、位置、透明度和帧数": "Bật/tắt, vị trí, độ mờ và tốc độ khung hình trên màn hình nền",
  "整体律动、景深、封面和电影镜头": "Nhịp chuyển động, chiều sâu, bìa nhạc và góc máy điện ảnh",
  "粒子尺寸、运动、扭曲和溢光": "Kích cỡ, tốc độ, biến dạng hạt và ánh sáng",
  "地面形态、颜色和空间位置": "Hình dạng địa hình, màu sắc và vị trí không gian",
  "浮空方块的数量、尺寸和速度": "Số lượng, kích thước và tốc độ khối nổi",
  "显示方式": "Cách hiển thị",
  "模式、镜头、常驻状态和内容来源": "Chế độ, góc máy, trạng thái thường trực và nguồn nội dung",
  "歌单架颜色、大小、位置和透明度": "Màu, kích thước, vị trí và độ trong của giá danh sách nhạc",
  "详情页位置、比例、角度与行距": "Vị trí, tỷ lệ, góc xoay và khoảng cách dòng chi tiết",
  "展开、关闭和歌曲行入场手感": "Tốc độ mở, đóng và hiệu ứng xuất hiện của từng dòng bài hát",
  "歌单架整体唤出、收起和镜头速度": "Hiệu ứng gọi ra, thu gọn và tốc độ góc máy",
  "摄像头手势触碰开关": "Bật/tắt điều khiển bằng cử chỉ camera",
  "启动与退出": "Khởi động và thoát",
  "关闭窗口行为和恢复播放方式": "Cách đóng cửa sổ và khôi phục nhạc",
  "播放输出": "Đầu ra âm thanh",
  "音频输出设备和路由面板": "Thiết bị đầu ra và định tuyến âm thanh",
  "性能与后台": "Hiệu năng và chạy nền",
  "画质档位、后台渲染和直播保持": "Chất lượng hình ảnh, dựng hình nền và giữ luồng trực tiếp",
  "内存管理": "Quản lý bộ nhớ",
  "播放器压缩、系统释放范围和阈值": "Tối ưu RAM trình phát, phạm vi giải phóng và ngưỡng hệ thống",
  "缓存与存储": "Bộ đệm và lưu trữ",
  "统一缓存目录、占用和各类路径": "Thư mục bộ đệm, dung lượng và đường dẫn",
  "实验功能": "Tính năng thử nghiệm",
  "尚未开放或需要谨慎使用的能力": "Các tính năng chưa mở hoặc cần sử dụng thận trọng",
  "其他设置": "Thiết lập khác",
  "尚未归入明确分类的兼容项": "Tùy chọn tương thích chưa được phân loại",
  "裁切左右": "Cắt ảnh theo chiều ngang",
  "裁切上下": "Cắt ảnh theo chiều dọc",
  "裁切缩放": "Thu phóng ảnh nền",
  "歌词自定义颜色": "Màu lời bài hát tùy chọn",
  "歌词清晰度": "Độ rõ của lời bài hát",
  "上下旋转": "Xoay lên / xuống",
  "左右旋转": "Xoay trái / phải",
  "故障细节": "Chi tiết hiệu ứng nhiễu",
  "桌面歌词透明度": "Độ trong suốt lời trên desktop",
  "电影镜头开关": "Bật/tắt góc máy điện ảnh",
  "运动速度": "Tốc độ chuyển động",
  "粒子扭曲": "Độ biến dạng hạt",
  "上层高光": "Ánh sáng lớp trên",
  "峰值高光": "Ánh sáng đỉnh",
  "恢复播放位置": "Khôi phục vị trí phát",
  "后台渲染策略": "Cách dựng hình khi chạy nền",
  "系统内存状态": "Trạng thái RAM hệ thống",
  "内存说明": "Thông tin bộ nhớ",
  "系统释放范围": "Phạm vi giải phóng RAM",
  "定时释放": "Giải phóng theo lịch",
  "占用阈值": "Ngưỡng sử dụng",
  "手动内存操作": "Thao tác RAM thủ công",
  "emily专辑封面": "Bìa album Emily",
  "封面粒子 · 快速入场": "Hạt từ bìa nhạc · xuất hiện nhanh",
  "滚筒": "Đường hầm",
  "隧道 · 沉浸感": "Đường hầm · không gian chìm đắm",
  "星球": "Hành tinh",
  "星球 · 雕塑感": "Hành tinh · hiệu ứng điêu khắc",
  "虚空": "Không gian trống",
  "无粒子 · 自定义背景": "Không hạt · nền tùy chỉnh",
  "唱片": "Đĩa nhạc",
  "唱片 · 圆形封面": "Đĩa nhạc · bìa hình tròn",
  "星河": "Ngân hà",
  "壁纸粒子 · 音乐律动": "Hạt hình nền · theo nhịp nhạc",
  "安魂": "An hồn",
  "骷髅·YUI7W": "Bộ xương · YUI7W",
  "音域回响": "Vọng âm",
  "作者 Ajin": "Tác giả Ajin",
  "作者 CmzYa": "Tác giả CmzYa",
  "作者": "Tác giả",
  "月蚀圣环": "Vòng nguyệt thực",
  "黑曜轨道 · 冷金日冕": "Quỹ đạo hắc diện · quầng sáng vàng lạnh",
  "雨幕霓虹": "Mưa neon",
  "城市雨丝 · 色谱残光": "Mưa phố thị · dư quang đa sắc",
  "折光蝶群": "Đàn bướm lăng kính",
  "折纸翼阵 · 光谱迁徙": "Cánh giấy · chuyển động quang phổ",
  "深海绽放": "Nở hoa biển sâu",
  "生物荧光 · 潮汐花冠": "Phát quang sinh học · hoa triều",
  "搜索视觉控制台功能": "Tìm chức năng bảng điều khiển hình ảnh",
  "搜索功能，如：粒子、缓存、歌词": "Tìm chức năng, ví dụ: hạt, bộ đệm, lời hát",
  "撤销上一步设置": "Hoàn tác thay đổi vừa rồi",
  "撤销": "Hoàn tác",
  "历史": "Lịch sử",
  "最近操作": "Thao tác gần đây",
  "视觉控制台分类": "Nhóm chức năng hình ảnh",
  "封面原图 / 图片 / 视频": "Ảnh bìa gốc / ảnh / video",
  "支持封面原图、图片 / 视频上传，已设置媒体可重复裁切": "Hỗ trợ bìa gốc, ảnh và video; có thể cắt lại sau khi chọn",
  "视觉预设: ": "Bộ hiệu ứng: ",
  "视觉预设": "Bộ hiệu ứng hình ảnh",
  "用户存档": "Hồ sơ cài đặt",
  "空槽位": "Ô lưu trống",
  "刚刚保存": "Vừa lưu",
  "分钟前": "phút trước",
  "小时前": "giờ trước",
  "天前": "ngày trước",
  "存档 ": "Hồ sơ ",
  "用户存档 ": "Hồ sơ ",
  "空白存档，点击保存写入当前视觉": "Hồ sơ trống; nhấn Lưu để ghi cài đặt hình ảnh",
  "主入口使用 MR2 短代码复制/粘贴；旧 JSON 仍可拖拽或作为兼容备份导入。": "Sao chép hoặc dán mã MR2 để chia sẻ cài đặt. Có thể nhập tệp JSON cũ để tương thích.",
  "新建": "Tạo mới",
  "粘贴码": "Dán mã",
  "导入 JSON": "Nhập JSON",
  "把 MR2 短代码粘到这里，也兼容旧 JSON 存档": "Dán mã MR2 hoặc nội dung hồ sơ JSON cũ vào đây",
  "从剪贴板粘贴": "Dán từ bộ nhớ tạm",
  "导入短码": "Nhập mã",
  "清空": "Xóa nội dung",
  "确定": "Xác nhận",
  "取消": "Hủy",
  "应用": "Áp dụng",
  "保存": "Lưu",
  "复制码": "Sao chép mã",
  "命名": "Đổi tên",
  "文件": "Xuất tệp",
  "删除": "Xóa",
  "新建空白存档": "Tạo hồ sơ trống",
  "可继续创建，不限制 4 个": "Có thể tạo thêm không giới hạn bốn hồ sơ",
  "用户存档保存失败，本地存储空间可能不足": "Không thể lưu hồ sơ, có thể không đủ dung lượng lưu trữ",
  "已保存到 ": "Đã lưu vào ",
  "已应用 ": "Đã áp dụng ",
  "已命名为 ": "Đã đổi tên thành ",
  "已删除用户存档": "Đã xóa hồ sơ",
  "这个用户存档还是空白": "Hồ sơ này vẫn trống",
  "已新建空白用户存档": "Đã tạo hồ sơ trống",
  "空白存档不能复制短码": "Không thể sao chép mã của hồ sơ trống",
  "用户存档短码已复制": "Đã sao chép mã hồ sơ",
  "复制这段 MR2 短代码": "Sao chép mã MR2 này",
  "已打开完整短码": "Đã mở mã đầy đủ",
  "短码生成失败": "Không thể tạo mã chia sẻ",
  "完整短码已复制，配置较长": "Đã sao chép mã đầy đủ (cấu hình dài)",
  "短码校验失败，未导入": "Mã chia sẻ không hợp lệ, chưa nhập",
  "短码无效，未导入": "Mã chia sẻ không dùng được, chưa nhập",
  "剪贴板里没有可粘贴的存档码": "Bộ nhớ tạm không có mã hồ sơ",
  "短码已粘到输入框": "Đã dán mã vào ô nhập",
  "已粘到输入框，可尝试作为旧 JSON 导入": "Đã dán vào ô nhập, có thể thử nhập dưới dạng JSON cũ",
  "先把 MR2 短码粘到输入框": "Hãy dán mã MR2 vào ô nhập trước",
  "已导入短码 ": "Đã nhập mã ",
  "空白存档不能导出": "Không thể xuất hồ sơ trống",
  "已保存到": "Đã lưu vào",
  "色彩方案": "Bảng màu",
  "雾蓝": "Xanh lam sương",
  "银蓝": "Xanh bạc",
  "冰川": "Xanh băng",
  "青绿": "Xanh lục ngọc",
  "松针": "Xanh thông",
  "月白": "Trắng ánh trăng",
  "岩金": "Vàng đá",
  "琥珀": "Hổ phách",
  "暮粉": "Hồng hoàng hôn",
  "玫红": "Hồng cánh sen",
  "烟紫": "Tím khói",
  "电紫": "Tím điện",
  "靛蓝": "Chàm",
  "海蓝": "Xanh biển",
  "霓青": "Xanh neon",
  "夜绿": "Lục đêm",
  "酒红": "Đỏ rượu",
  "墨黑": "Đen mực",
  "拖动调整顺序": "Kéo để đổi thứ tự",
  "已保存酷狗音乐会话": "Đã lưu phiên KuGou Music",
  "登录窗口已关闭": "Cửa sổ đăng nhập đã đóng",
  "扫描二维码": "Quét mã QR",
  "二维码": "Mã QR",
  "重新生成二维码": "Tạo lại mã QR",
  "正在保存网易云会话…": "Đang lưu phiên NetEase…",
  "网易云会话不可用": "Phiên NetEase không khả dụng",
  "网易云会话已保存": "Đã lưu phiên NetEase",
  "网易云已登录: ": "Đã đăng nhập NetEase: ",
  "网易云会话保存失败": "Không thể lưu phiên NetEase",
  "请在 App 中扫码": "Quét mã QR bằng ứng dụng trên điện thoại",
  "已扫码, 请在手机确认…": "Đã quét mã, hãy xác nhận trên điện thoại…",
  "登录成功，正在同步账号资料…": "Đăng nhập thành công, đang đồng bộ tài khoản…",
  "登录成功！": "Đăng nhập thành công!",
  "扫码已确认，但没有拿到登录凭证，请刷新二维码重试": "Đã xác nhận mã QR nhưng không nhận được phiên đăng nhập; vui lòng thử lại",
  "欢迎 ": "Chào mừng ",
  "网易云用户": "Người dùng NetEase",
  "QQ 音乐登录已失效": "Phiên đăng nhập QQ Music đã hết hạn",
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
  "鼠标穿透 防误触": "Chuột xuyên qua, tránh chạm nhầm",
  "桌面字号": "Cỡ chữ trên desktop",
  "桌面位置": "Vị trí trên desktop",
  "基础画面": "Hình ảnh cơ bản",
  "音乐响应 节奏": "Phản ứng theo nhịp nhạc",
  "粒子数量 分辨率": "Số hạt, độ phân giải",
  "粒子与光影": "Hạt và ánh sáng",
  "粒子光晕": "Hào quang hạt",
  "边缘光": "Viền sáng",
  "星空 粒子背景": "Bầu trời sao, nền hạt",
  "点大小": "Kích thước điểm sáng",
  "光晕强度": "Cường độ hào quang",
  "溢光 bloom": "Ánh sáng bloom",
  "粒子散开": "Độ tản hạt",
  "背景压暗": "Làm tối nền",
  "音域振幅": "Biên độ địa hình âm thanh",
  "地形运动": "Chuyển động địa hình",
  "网格密度": "Mật độ lưới",
  "地形大小": "Kích thước địa hình",
  "地形景深": "Độ sâu địa hình",
  "音域底色": "Màu nền địa hình",
  "音域冷色": "Màu lạnh địa hình",
  "音域暖色": "Màu ấm địa hình",
  "音域强调色": "Màu nhấn địa hình",
  "地形辉光": "Ánh sáng địa hình",
  "频谱响应": "Phản ứng phổ âm",
  "Kick 检测、频段范围和各段权重": "Nhận diện kick, dải tần và trọng số",
  "音频分析 频谱开关": "Phân tích âm thanh, bật/tắt phổ",
  "鼓点自动追踪": "Tự theo dõi nhịp trống",
  "音频监视器": "Trình giám sát âm thanh",
  "频谱起点": "Điểm đầu phổ",
  "频谱终点": "Điểm cuối phổ",
  "频谱门限": "Ngưỡng phổ",
  "频谱脉冲": "Xung phổ",
  "浮空数量": "Số phần tử bay",
  "浮空强度": "Độ mạnh nổi",
  "最小尺寸": "Kích thước nhỏ nhất",
  "最大尺寸": "Kích thước lớn nhất",
  "音域回响 · WE": "Vọng âm địa hình · WE",
  "Wallpaper Engine 派生地形的响应与配色": "Phản ứng và màu của địa hình dựa trên Wallpaper Engine",
  "WE 输入增益": "Độ khuếch đại đầu vào WE",
  "WE 音频强度": "Cường độ âm thanh WE",
  "WE 范围": "Phạm vi WE",
  "WE 峰值": "Đỉnh WE",
  "WE 主题基色": "Màu cơ bản WE",
  "地形底色": "Màu nền địa hình",
  "WE 底色": "Màu nền WE",
  "暖色主体": "Tông màu ấm",
  "WE 暖色": "Màu ấm WE",
  "WE 冷色": "Màu lạnh WE",
  "波纹亮区": "Vùng gợn sáng",
  "WE 波纹": "Gợn sóng WE",
  "WE 主题": "Chủ đề WE",
  "3D 播客": "Podcast 3D",
  "外观与位置": "Giao diện và vị trí",
  "3D 强调色": "Màu nhấn 3D",
  "详情页位置": "Vị trí trang chi tiết",
  "详情页水平": "Chi tiết theo chiều ngang",
  "详情页垂直": "Chi tiết theo chiều dọc",
  "详情页景深": "Độ sâu trang chi tiết",
  "详情页动画": "Hoạt ảnh trang chi tiết",
  "歌曲行动画": "Hoạt ảnh hàng bài hát",
  "详情入场位移": "Khoảng dịch chuyển khi hiện chi tiết",
  "详情视差": "Thị sai trang chi tiết",
  "唤出动画": "Hoạt ảnh mở",
  "Scene · Wallpaper Engine 原生实时运行": "Scene · chạy trực tiếp bằng Wallpaper Engine",
  "Scene · 预览（未找到有效 PKGV 场景包）": "Scene · xem trước (thiếu gói PKGV hợp lệ)",
  "Web · 安全预览（未执行 HTML）": "Web · xem trước an toàn (không chạy HTML)",
  "Application · 安全预览（未运行程序）": "Ứng dụng · xem trước an toàn (không chạy chương trình)",
  "桌面被动模式 · 项目预览": "Desktop thụ động · xem trước dự án",
  "所选 .pkg/.pak 不是有效的 Wallpaper Engine PKGV 场景包": "Tệp .pkg/.pak được chọn không phải gói Scene PKGV hợp lệ",
  "该场景缺少有效的 project.json": "Cảnh này thiếu project.json hợp lệ",
  "没有找到该项目的有效场景包": "Không tìm thấy gói cảnh hợp lệ",
  "Wallpaper Engine 实时运行失败": "Wallpaper Engine chạy trực tiếp thất bại",
  "动态媒体解码失败，已切换到安全预览": "Giải mã nội dung động thất bại; chuyển sang xem trước an toàn",
  "媒体不可用": "Không thể sử dụng nội dung media",
  "已启用安全预览，原背景仍保留": "Đã bật xem trước an toàn, vẫn giữ nền gốc",
  "选项": "Tùy chọn",
  "识别失败：": "Nhận diện thất bại: ",
  "扫描失败": "Quét thất bại",
  "Wallpaper Engine 识别失败": "Không thể nhận diện Wallpaper Engine",
  "导入失败": "Nhập thất bại",
  "Wallpaper Engine 目录导入失败": "Nhập thư mục Wallpaper Engine thất bại",
  "项目文件导入失败": "Nhập tệp dự án thất bại",
  " · 桌面被动模式 · 项目预览": " · Desktop thụ động · xem trước dự án",
  " · 桌面被动模式 · 原背景": " · Desktop thụ động · nền gốc",
  " · WE 引擎实时运行": " · WE chạy trực tiếp",
  " · 原背景保留": " · Giữ nền gốc",
  "正在恢复 ": "Đang khôi phục ",
  "壁纸": "Hình nền",
  "专辑已收藏到": "Đã lưu album vào",
  "音乐用户": "Người dùng nhạc",
  " 赞": " lượt thích",
  "专辑": "Album",
  "歌手": "Nghệ sĩ",
  "来源": "Nguồn",
  "关联歌手": "Nghệ sĩ liên quan",
  "所属专辑": "Thuộc album",
  "评论": "Bình luận",
  "未找到歌手信息": "Không có thông tin nghệ sĩ",
  "红心": "Yêu thích",
  "暂不支持此操作": "Chưa hỗ trợ thao tác này",
  "对应平台": "Nền tảng tương ứng",
  "歌曲标识": "Mã bài hát",
  "红心操作失败: ": "Không thể thay đổi yêu thích: ",
  "红心操作失败": "Không thể thay đổi yêu thích",
  "收藏失败": "Lưu thất bại",
  "收藏失败: ": "Lưu thất bại: ",
  "最近一首": "Bài mới nghe",
  "你的音乐": "Nhạc của bạn",
  "你的常听": "Bạn thường nghe",
  "Spotify 常听歌曲": "Bài nghe nhiều trên Spotify",
  "来自 Spotify Web API 的个人常听": "Bài nghe nhiều từ Spotify Web API",
  "推荐 FM": "FM đề xuất",
  "Mineradio 推荐": "Mineradio gợi ý",
  "已读取全部 ": "Đã tải đầy đủ ",
  "暂无可用推荐": "Chưa có gợi ý phù hợp",
  "正在读取": "Đang tải",
  "预设与存档": "Cấu hình và kho lưu",
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
        // Translate static attribute hints even on input/textarea elements;
        // never change their value or the user's typed content.
        if (!excludedIds.has(node.id || '')) bindUiAttributes(node);
        if (excluded.test(String(node.nodeName || '').toUpperCase()) || excludedIds.has(node.id || '')) return;
        // Do not run translations through dynamically supplied artist / title,
        // lyric, playlist, account, and user-generated content nodes.
        if (node.hasAttribute && (node.hasAttribute('data-song-id') ||
            node.hasAttribute('data-playlist-title') || node.hasAttribute('data-podcast-title'))) return;
        if (/(?:^|\s)(?:song-name|song-artist|song-title|qi-name|qi-artist|mini-queue-name|mini-queue-sub|pl-name|pl-sub|detail-song-title|detail-artist|detail-title|detail-value|artist-song-name|artist-song-meta|comment-text|comment-meta|home-next-title|home-today-artist|home-listen-value|home-platform-recommend-copy|lyric-text|lyrics-line|user-name|track-title|track-artist|user-archive-name|user-archive-input|custom-preset-name)(?:\s|$)/.test(String(node.className || ''))) return;
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


  const overflowSelector = [
    '#fx-panel button','#fx-panel label','#fx-panel .fx-title','#fx-panel .fx-sub',
    '#playlist-panel button','#playlist-panel .panel-tab','#playlist-panel .queue-head',
    '#login-modal button','#login-modal .login-auth-copy','#user-modal button',
    '#user-modal .account-hint','#track-detail-modal button',
    '#wallpaper-engine-modal button','#wallpaper-engine-modal .wallpaper-engine-status',
    '#update-modal button','#update-modal .update-item-text',
    '#collect-modal button','#local-beat-modal button','#custom-lyric-modal button',
    '.home-platform-recommend-modal button'
  ].join(',');
  let recentLayoutIssues = [];
  function auditLayout(rootNode) {
    if (locale !== VIETNAMESE || !rootNode || typeof rootNode.querySelectorAll !== 'function') {
      recentLayoutIssues = [];
      return [];
    }
    const controls = Array.from(rootNode.querySelectorAll(overflowSelector));
    if (rootNode.matches && rootNode.matches(overflowSelector)) controls.unshift(rootNode);
    const issues = [];
    for (const control of controls.slice(0,700)) {
      if (!control || !control.classList || !control.getClientRects ||
          !control.getClientRects().length) continue;
      const available = Number(control.clientWidth) || 0;
      const needed = Number(control.scrollWidth) || 0;
      const availableHeight = Number(control.clientHeight) || 0;
      const neededHeight = Number(control.scrollHeight) || 0;
      if ((available > 0 && needed > available + 2) ||
          (availableHeight > 0 && neededHeight > availableHeight + 2)) {
        control.classList.add('vi-copy-overflow');
        issues.push({ id:String(control.id || ''), tag:String(control.tagName || ''),
          available, needed, availableHeight, neededHeight });
      } else control.classList.remove('vi-copy-overflow');
    }
    recentLayoutIssues = issues;
    return issues.slice();
  }
  // The Vietnamese font may load after first paint and Electron windows can
  // be resized. Coalesce checks into one frame rather than racing layout/paint.
  const pendingLayoutRoots = new Set();
  let layoutAuditScheduled = false;
  function scheduleLayoutAudit(rootNode) {
    if (locale !== VIETNAMESE || !rootNode) return;
    pendingLayoutRoots.add(rootNode);
    if (layoutAuditScheduled) return;
    layoutAuditScheduled = true;
    const run = () => {
      layoutAuditScheduled = false;
      const roots = Array.from(pendingLayoutRoots);
      pendingLayoutRoots.clear();
      for (const node of roots) auditLayout(node);
    };
    if (typeof root.requestAnimationFrame === 'function') root.requestAnimationFrame(run);
    else run();
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
      scheduleLayoutAudit(doc);
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
    scheduleLayoutAudit(doc);
    // Readjust text whenever users change the Windows window size or fonts
    // complete loading, without touching WebGL, lyrics or the music player.
    if (typeof root.addEventListener === 'function') {
      root.addEventListener('resize', () => scheduleLayoutAudit(doc));
    }
    if (doc.fonts && doc.fonts.ready && typeof doc.fonts.ready.then === 'function') {
      Promise.resolve(doc.fonts.ready).then(() => scheduleLayoutAudit(doc)).catch(() => {});
    }
  }

  const api = Object.freeze({
    locales: ALLOWED,
    get locale() { return locale; },
    t, source, ui, bind, bindDynamicUi, auditLayout, scheduleLayoutAudit,
    getLayoutIssues: () => recentLayoutIssues.slice(), setLanguage, onChange,
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
