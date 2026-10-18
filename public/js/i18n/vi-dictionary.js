'use strict';
/* User-facing strings only. This file is additive across upstream Mineradio releases.
 * NEVER put a song title, artist name, lyric or account identifier in this dictionary.
 * Change translations here, not in the original application source files. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MineradioVietnamese = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const entries = [
  [
    "默认",
    "Mặc định"
  ],
  [
    "关闭",
    "Đóng"
  ],
  [
    "取消",
    "Hủy"
  ],
  [
    "确认",
    "Xác nhận"
  ],
  [
    "确定",
    "Đồng ý"
  ],
  [
    "完成",
    "Hoàn tất"
  ],
  [
    "保存",
    "Lưu"
  ],
  [
    "删除",
    "Xóa"
  ],
  [
    "清除",
    "Xóa"
  ],
  [
    "清空",
    "Xóa hết"
  ],
  [
    "刷新",
    "Làm mới"
  ],
  [
    "重试",
    "Thử lại"
  ],
  [
    "返回",
    "Quay lại"
  ],
  [
    "下一步",
    "Tiếp theo"
  ],
  [
    "上一步",
    "Trước đó"
  ],
  [
    "跳过",
    "Bỏ qua"
  ],
  [
    "继续",
    "Tiếp tục"
  ],
  [
    "选择",
    "Chọn"
  ],
  [
    "更换",
    "Thay đổi"
  ],
  [
    "打开",
    "Mở"
  ],
  [
    "收起",
    "Thu gọn"
  ],
  [
    "展开",
    "Mở rộng"
  ],
  [
    "显示",
    "Hiển thị"
  ],
  [
    "隐藏",
    "Ẩn"
  ],
  [
    "已开启",
    "Đã bật"
  ],
  [
    "已关闭",
    "Đã tắt"
  ],
  [
    "开启",
    "Bật"
  ],
  [
    "停止",
    "Dừng"
  ],
  [
    "暂停",
    "Tạm dừng"
  ],
  [
    "播放",
    "Phát"
  ],
  [
    "正在播放",
    "Đang phát"
  ],
  [
    "继续播放",
    "Tiếp tục phát"
  ],
  [
    "下一首",
    "Bài tiếp theo"
  ],
  [
    "上一首",
    "Bài trước"
  ],
  [
    "下一首播放",
    "Phát tiếp theo"
  ],
  [
    "播放全部",
    "Phát tất cả"
  ],
  [
    "单曲循环",
    "Lặp một bài"
  ],
  [
    "顺序循环",
    "Lặp theo thứ tự"
  ],
  [
    "随机播放",
    "Phát ngẫu nhiên"
  ],
  [
    "随机",
    "Ngẫu nhiên"
  ],
  [
    "列表循环",
    "Lặp danh sách"
  ],
  [
    "音量",
    "Âm lượng"
  ],
  [
    "静音",
    "Tắt tiếng"
  ],
  [
    "全屏",
    "Toàn màn hình"
  ],
  [
    "最小化",
    "Thu nhỏ"
  ],
  [
    "最大化",
    "Phóng to"
  ],
  [
    "退出全屏",
    "Thoát toàn màn hình"
  ],
  [
    "退出",
    "Thoát"
  ],
  [
    "关闭窗口",
    "Đóng cửa sổ"
  ],
  [
    "主页",
    "Trang chủ"
  ],
  [
    "音乐库",
    "Thư viện nhạc"
  ],
  [
    "最近播放",
    "Nghe gần đây"
  ],
  [
    "每日推荐",
    "Gợi ý hằng ngày"
  ],
  [
    "我的歌单",
    "Danh sách nhạc của tôi"
  ],
  [
    "歌单",
    "Danh sách phát"
  ],
  [
    "歌单架",
    "Kệ danh sách phát"
  ],
  [
    "3D 歌单架",
    "Kệ nhạc 3D"
  ],
  [
    "常开歌单",
    "Luôn hiện danh sách phát"
  ],
  [
    "当前队列",
    "Hàng đợi hiện tại"
  ],
  [
    "当前歌曲",
    "Bài hát hiện tại"
  ],
  [
    "当前音源",
    "Nguồn nhạc hiện tại"
  ],
  [
    "正在加载",
    "Đang tải"
  ],
  [
    "加载中",
    "Đang tải"
  ],
  [
    "加载失败",
    "Tải thất bại"
  ],
  [
    "无数据",
    "Không có dữ liệu"
  ],
  [
    "暂无数据",
    "Chưa có dữ liệu"
  ],
  [
    "无结果",
    "Không có kết quả"
  ],
  [
    "搜索",
    "Tìm kiếm"
  ],
  [
    "搜索历史",
    "Lịch sử tìm kiếm"
  ],
  [
    "搜索歌曲、歌手...",
    "Tìm bài hát hoặc nghệ sĩ..."
  ],
  [
    "搜索歌曲、歌手…",
    "Tìm bài hát hoặc nghệ sĩ…"
  ],
  [
    "搜索播客、电台...",
    "Tìm podcast hoặc đài phát..."
  ],
  [
    "搜索网易云音乐...",
    "Tìm trên NetEase Music..."
  ],
  [
    "搜索 QQ 音乐...",
    "Tìm trên QQ Music..."
  ],
  [
    "搜索酷狗音乐...",
    "Tìm trên Kugou Music..."
  ],
  [
    "搜索汽水音乐匹配源...",
    "Tìm nguồn nhạc Qishui..."
  ],
  [
    "搜索能力暂未就绪，请先完成该平台连接",
    "Chưa thể tìm kiếm, hãy kết nối nền tảng trước"
  ],
  [
    "当前没有可用的音乐目录搜索源",
    "Hiện không có nguồn tìm kiếm nhạc"
  ],
  [
    "没有找到相关歌曲",
    "Không tìm thấy bài hát phù hợp"
  ],
  [
    "搜索暂时失败，请稍后重试",
    "Tìm kiếm thất bại, vui lòng thử lại sau"
  ],
  [
    "正在加载更多歌曲…",
    "Đang tải thêm bài hát…"
  ],
  [
    "继续滚动加载更多歌曲",
    "Cuộn xuống để tải thêm bài hát"
  ],
  [
    "切换音源",
    "Đổi nguồn nhạc"
  ],
  [
    "正在匹配",
    "Đang đối chiếu"
  ],
  [
    "匹配源",
    "Nguồn tương ứng"
  ],
  [
    "可切换",
    "Có thể đổi"
  ],
  [
    "检测中",
    "Đang kiểm tra"
  ],
  [
    "当前",
    "Hiện tại"
  ],
  [
    "保留当前进度",
    "Giữ vị trí phát hiện tại"
  ],
  [
    "无匹配",
    "Không có nguồn tương ứng"
  ],
  [
    "未找到可切换音源",
    "Không tìm thấy nguồn thay thế"
  ],
  [
    "音源切换失败",
    "Đổi nguồn nhạc thất bại"
  ],
  [
    "正在切换音源",
    "Đang đổi nguồn nhạc"
  ],
  [
    "该平台无正版音源",
    "Nền tảng này không có nguồn phù hợp"
  ],
  [
    "自动换源",
    "Tự động đổi nguồn"
  ],
  [
    "播放控制失败",
    "Điều khiển phát nhạc thất bại"
  ],
  [
    "播放启动失败, 请重新选择歌曲",
    "Không thể phát, hãy chọn lại bài hát"
  ],
  [
    "播放被系统拦截, 请点击播放按钮",
    "Hệ thống chặn tự phát, hãy nhấn Phát"
  ],
  [
    "已保留当前播放队列，请稍后再试。",
    "Đã giữ hàng đợi hiện tại, vui lòng thử lại sau."
  ],
  [
    "播放模式:",
    "Chế độ phát:"
  ],
  [
    "队列已随机",
    "Đã trộn hàng đợi"
  ],
  [
    "歌曲详情",
    "Chi tiết bài hát"
  ],
  [
    "专辑详情",
    "Chi tiết album"
  ],
  [
    "歌手详情",
    "Chi tiết nghệ sĩ"
  ],
  [
    "收藏到歌单",
    "Thêm vào danh sách phát"
  ],
  [
    "取消红心",
    "Bỏ yêu thích"
  ],
  [
    "红心喜欢",
    "Yêu thích"
  ],
  [
    "喜欢",
    "Yêu thích"
  ],
  [
    "我的收藏",
    "Mục yêu thích"
  ],
  [
    "批量导入到队列",
    "Nhập nhiều bài vào hàng đợi"
  ],
  [
    "导入并立即播放",
    "Nhập và phát ngay"
  ],
  [
    "单曲文件",
    "Tệp nhạc"
  ],
  [
    "多曲文件夹",
    "Thư mục nhạc"
  ],
  [
    "导入音乐或封面",
    "Nhập nhạc hoặc ảnh bìa"
  ],
  [
    "导入入口",
    "Nhập dữ liệu"
  ],
  [
    "拖到 MR 接入口",
    "Kéo vào khu vực nhập MR"
  ],
  [
    "上传",
    "Tải lên"
  ],
  [
    "本地音乐",
    "Nhạc trong máy"
  ],
  [
    "本地文件",
    "Tệp trên máy"
  ],
  [
    "导入音乐",
    "Nhập nhạc"
  ],
  [
    "封面图片",
    "Ảnh bìa"
  ],
  [
    "封面",
    "Bìa album"
  ],
  [
    "自定义封面",
    "Bìa tùy chỉnh"
  ],
  [
    "给当前歌曲换封面",
    "Đổi bìa bài đang phát"
  ],
  [
    "取消自定义封面",
    "Bỏ bìa tùy chỉnh"
  ],
  [
    "选择 MP4",
    "Chọn MP4"
  ],
  [
    "移除视频",
    "Xóa video"
  ],
  [
    "背景视频",
    "Video nền"
  ],
  [
    "背景图片",
    "Ảnh nền"
  ],
  [
    "更换背景",
    "Thay nền"
  ],
  [
    "恢复原背景",
    "Khôi phục nền gốc"
  ],
  [
    "使用当前封面原图",
    "Dùng ảnh bìa gốc"
  ],
  [
    "封面取色",
    "Lấy màu từ bìa"
  ],
  [
    "取色",
    "Lấy mẫu màu"
  ],
  [
    "自定义颜色",
    "Màu tùy chỉnh"
  ],
  [
    "视觉控制台",
    "Bảng điều khiển hiệu ứng"
  ],
  [
    "展开播放器控制台",
    "Mở bảng điều khiển nhạc"
  ],
  [
    "视觉预设",
    "Mẫu hiệu ứng"
  ],
  [
    "视觉预设:",
    "Mẫu hiệu ứng:"
  ],
  [
    "用户存档",
    "Bộ mẫu đã lưu"
  ],
  [
    "视觉主色",
    "Màu hiệu ứng chính"
  ],
  [
    "视觉图标",
    "Biểu tượng hiệu ứng"
  ],
  [
    "背景颜色",
    "Màu nền"
  ],
  [
    "背景透明度",
    "Độ trong suốt của nền"
  ],
  [
    "界面高亮",
    "Màu nhấn giao diện"
  ],
  [
    "界面高亮色",
    "Màu nhấn giao diện"
  ],
  [
    "主页图标",
    "Biểu tượng trang chủ"
  ],
  [
    "首页",
    "Trang chủ"
  ],
  [
    "回到 Home",
    "Về trang chủ"
  ],
  [
    "Home 填充",
    "Màu nền Trang chủ"
  ],
  [
    "Home 填充色",
    "Màu nền Trang chủ"
  ],
  [
    "换一条",
    "Đổi gợi ý"
  ],
  [
    "换一首，也许正合心意",
    "Thử bài khác, biết đâu hợp gu"
  ],
  [
    "平台热歌与个人偏好",
    "Bài thịnh hành và sở thích"
  ],
  [
    "平台推荐",
    "Gợi ý từ nền tảng"
  ],
  [
    "推荐电台 / 歌单",
    "Đài phát / Danh sách được gợi ý"
  ],
  [
    "刷新当前平台",
    "Làm mới nền tảng hiện tại"
  ],
  [
    "网易云",
    "NetEase Music"
  ],
  [
    "网易云音乐",
    "NetEase Music"
  ],
  [
    "QQ 音乐",
    "QQ Music"
  ],
  [
    "QQ音乐",
    "QQ Music"
  ],
  [
    "酷狗",
    "Kugou"
  ],
  [
    "酷狗音乐",
    "Kugou Music"
  ],
  [
    "汽水",
    "Qishui"
  ],
  [
    "汽水音乐",
    "Qishui Music"
  ],
  [
    "点击进入",
    "Nhấn để vào"
  ],
  [
    "点击空白处也可以继续",
    "Nhấn vào khoảng trống để tiếp tục"
  ],
  [
    "查看使用引导",
    "Xem hướng dẫn sử dụng"
  ],
  [
    "发现新版本",
    "Có phiên bản mới"
  ],
  [
    "开启 DIY 玩家模式",
    "Bật chế độ DIY"
  ],
  [
    "自动隐藏视觉控制台",
    "Tự động ẩn bảng hiệu ứng"
  ],
  [
    "自动隐藏账号胶囊",
    "Tự động ẩn tài khoản"
  ],
  [
    "登录账号",
    "Đăng nhập"
  ],
  [
    "退出登录",
    "Đăng xuất"
  ],
  [
    "账号",
    "Tài khoản"
  ],
  [
    "登录",
    "Đăng nhập"
  ],
  [
    "注册",
    "Đăng ký"
  ],
  [
    "官方扫码 / Cookie",
    "Quét mã / Cookie chính thức"
  ],
  [
    "二维码",
    "Mã QR"
  ],
  [
    "扫码登录",
    "Đăng nhập bằng QR"
  ],
  [
    "刷新二维码",
    "Làm mới mã QR"
  ],
  [
    "导出到桌面",
    "Xuất ra màn hình nền"
  ],
  [
    "暂不导出",
    "Chưa xuất"
  ],
  [
    "是否导出登录 cookie 到桌面？",
    "Bạn có muốn xuất cookie đăng nhập ra màn hình nền?"
  ],
  [
    "导出的文件会用于备份当前平台登录态。",
    "Tệp xuất dùng để sao lưu phiên đăng nhập hiện tại."
  ],
  [
    "连接",
    "Kết nối"
  ],
  [
    "断开连接",
    "Ngắt kết nối"
  ],
  [
    "正在连接",
    "Đang kết nối"
  ],
  [
    "设置",
    "Cài đặt"
  ],
  [
    "高级设置",
    "Cài đặt nâng cao"
  ],
  [
    "恢复默认",
    "Khôi phục mặc định"
  ],
  [
    "恢复默认值",
    "Khôi phục giá trị mặc định"
  ],
  [
    "恢复当前滑条默认值",
    "Đưa thanh trượt về mặc định"
  ],
  [
    "已恢复默认数值",
    "Đã khôi phục giá trị mặc định"
  ],
  [
    "画质",
    "Chất lượng hình ảnh"
  ],
  [
    "画质档位:",
    "Mức chất lượng hình:"
  ],
  [
    "低",
    "Thấp"
  ],
  [
    "中",
    "Trung bình"
  ],
  [
    "高",
    "Cao"
  ],
  [
    "超高",
    "Rất cao"
  ],
  [
    "1× 标清",
    "1× Tiêu chuẩn"
  ],
  [
    "2× 高清",
    "2× Sắc nét"
  ],
  [
    "3× 超清",
    "3× Siêu nét"
  ],
  [
    "4× 极致",
    "4× Tối đa"
  ],
  [
    "帧率",
    "Tốc độ khung hình"
  ],
  [
    "前台帧率上限",
    "Giới hạn FPS khi mở ứng dụng"
  ],
  [
    "前台帧率上限:",
    "Giới hạn FPS khi mở ứng dụng:"
  ],
  [
    "前台帧率: 跟随屏幕垂直同步",
    "FPS: Đồng bộ theo màn hình"
  ],
  [
    "后台策略: 保持运行",
    "Khi chạy nền: Tiếp tục chạy"
  ],
  [
    "后台策略: 停止并释放",
    "Khi chạy nền: Dừng và giải phóng"
  ],
  [
    "后台策略: 自动优化",
    "Khi chạy nền: Tự tối ưu"
  ],
  [
    "镜头",
    "Camera"
  ],
  [
    "镜头与叠加",
    "Camera và lớp phủ"
  ],
  [
    "镜头控制",
    "Điều khiển camera"
  ],
  [
    "自由镜头",
    "Camera tự do"
  ],
  [
    "自动镜头",
    "Camera tự động"
  ],
  [
    "节拍镜头",
    "Camera theo nhịp"
  ],
  [
    "摄像头交互",
    "Tương tác camera"
  ],
  [
    "画面景深",
    "Độ sâu trường ảnh"
  ],
  [
    "前后景深",
    "Độ sâu trước/sau"
  ],
  [
    "画面基础",
    "Thiết lập hình ảnh"
  ],
  [
    "粒子高级参数",
    "Tùy chỉnh hạt nâng cao"
  ],
  [
    "律动强度",
    "Cường độ nhịp"
  ],
  [
    "律动",
    "Chuyển động theo nhịp"
  ],
  [
    "速度",
    "Tốc độ"
  ],
  [
    "旋转",
    "Xoay"
  ],
  [
    "缩放",
    "Thu phóng"
  ],
  [
    "透明度",
    "Độ trong suốt"
  ],
  [
    "亮度",
    "Độ sáng"
  ],
  [
    "对比度",
    "Độ tương phản"
  ],
  [
    "饱和度",
    "Độ bão hòa"
  ],
  [
    "颜色",
    "Màu sắc"
  ],
  [
    "渐变",
    "Chuyển màu"
  ],
  [
    "高光",
    "Vùng sáng"
  ],
  [
    "地形暗部",
    "Vùng tối địa hình"
  ],
  [
    "冷色峰值",
    "Đỉnh màu lạnh"
  ],
  [
    "暖色峰值",
    "Đỉnh màu ấm"
  ],
  [
    "涟漪高光",
    "Ánh sáng gợn sóng"
  ],
  [
    "歌词",
    "Lời bài hát"
  ],
  [
    "歌词开关",
    "Bật/tắt lời bài hát"
  ],
  [
    "歌词来源",
    "Nguồn lời bài hát"
  ],
  [
    "歌词行数",
    "Số dòng lời"
  ],
  [
    "显示行数",
    "Số dòng hiển thị"
  ],
  [
    "歌词动画",
    "Hiệu ứng lời bài hát"
  ],
  [
    "歌词外观",
    "Kiểu hiển thị lời"
  ],
  [
    "歌词溢光",
    "Ánh sáng tỏa của lời"
  ],
  [
    "歌词溢光强度",
    "Cường độ ánh sáng lời"
  ],
  [
    "歌词溢光颜色",
    "Màu ánh sáng lời"
  ],
  [
    "文字颜色",
    "Màu chữ"
  ],
  [
    "跟唱高亮",
    "Tô sáng theo lời hát"
  ],
  [
    "跟随歌词",
    "Theo lời bài hát"
  ],
  [
    "跟随高亮",
    "Theo phần tô sáng"
  ],
  [
    "后层溢光",
    "Ánh sáng lớp sau"
  ],
  [
    "跟随鼓点",
    "Theo nhịp trống"
  ],
  [
    "歌词清晰度:",
    "Độ nét lời bài hát:"
  ],
  [
    "字体与字距",
    "Phông chữ và khoảng cách"
  ],
  [
    "位置与角度",
    "Vị trí và góc"
  ],
  [
    "上下位置",
    "Vị trí dọc"
  ],
  [
    "左右位置",
    "Vị trí ngang"
  ],
  [
    "双行",
    "Hai dòng"
  ],
  [
    "单行",
    "Một dòng"
  ],
  [
    "原文",
    "Nguyên văn"
  ],
  [
    "译文",
    "Bản dịch"
  ],
  [
    "译文字号",
    "Cỡ chữ bản dịch"
  ],
  [
    "译文透明",
    "Độ trong suốt bản dịch"
  ],
  [
    "自定义",
    "Tùy chỉnh"
  ],
  [
    "色轮取色",
    "Chọn màu trên bánh xe"
  ],
  [
    "高亮取色",
    "Chọn màu nhấn"
  ],
  [
    "溢光取色",
    "Chọn màu ánh sáng"
  ],
  [
    "桌面歌词",
    "Lời bài hát trên màn hình nền"
  ],
  [
    "桌面歌词帧率",
    "FPS lời bài hát trên desktop"
  ],
  [
    "桌面歌词按播放进度高亮",
    "Tô sáng lời trên desktop theo tiến độ"
  ],
  [
    "桌面歌词绑定鼓点电影震动，基础漂浮始终保留",
    "Lời desktop rung theo nhịp trống, vẫn giữ hiệu ứng nổi"
  ],
  [
    "锁定后防误触；鼠标移到桌面歌词上按中键可锁定/解锁",
    "Khóa để tránh chạm nhầm; nhấn nút chuột giữa lên lời để khóa/mở"
  ],
  [
    "歌词溢光强度",
    "Cường độ phát sáng lời hát"
  ],
  [
    "歌单架颜色",
    "Màu kệ nhạc"
  ],
  [
    "歌单架镜头",
    "Camera kệ nhạc"
  ],
  [
    "歌单架显示",
    "Hiển thị kệ nhạc"
  ],
  [
    "歌单架外观",
    "Giao diện kệ nhạc"
  ],
  [
    "歌单架参数",
    "Thông số kệ nhạc"
  ],
  [
    "歌单架唤出动画",
    "Chuyển động mở kệ nhạc"
  ],
  [
    "歌单详情页位置",
    "Vị trí trang danh sách"
  ],
  [
    "歌单详情页动画",
    "Chuyển động trang danh sách"
  ],
  [
    "左侧歌单栏",
    "Thanh danh sách bên trái"
  ],
  [
    "歌单、本地音乐和已登录平台",
    "Danh sách phát, nhạc trên máy và tài khoản đã đăng nhập"
  ],
  [
    "从当前队列或最近播放继续",
    "Tiếp tục từ hàng đợi hoặc bài nghe gần đây"
  ],
  [
    "播放过的歌曲会出现在这里",
    "Bài đã phát sẽ xuất hiện tại đây"
  ],
  [
    "使用当前 Mineradio 推荐数据",
    "Dùng gợi ý của Mineradio"
  ],
  [
    "今日歌曲",
    "Bài hát hôm nay"
  ],
  [
    "聆听时长",
    "Thời gian nghe"
  ],
  [
    "等待记录",
    "Chưa có dữ liệu"
  ],
  [
    "开始播放后生成",
    "Dữ liệu xuất hiện sau khi phát"
  ],
  [
    "队列里还没有歌曲",
    "Hàng đợi chưa có bài hát"
  ],
  [
    "点击打开音乐库",
    "Nhấn để mở thư viện"
  ],
  [
    "从每日推荐、歌单与本地音乐中挑选",
    "Chọn từ gợi ý, danh sách và nhạc trên máy"
  ],
  [
    "只读取平台可验证的推荐数据，不用关键词搜索替代。",
    "Chỉ lấy gợi ý xác thực từ nền tảng, không thay bằng tìm kiếm từ khóa."
  ],
  [
    "打开平台推荐中心；没有可信推荐接口时会明确留空",
    "Mở gợi ý nền tảng; để trống nếu không có dữ liệu đáng tin"
  ],
  [
    "读取每日歌曲、推荐歌单与推荐 Feed，不用关键词搜索",
    "Lấy bài hằng ngày, danh sách và luồng gợi ý, không dùng tìm kiếm từ khóa"
  ],
  [
    "当前系统不支持桌面壁纸模式",
    "Hệ thống hiện không hỗ trợ chế độ hình nền desktop"
  ],
  [
    "开发中，暂不可用",
    "Đang phát triển, hiện chưa sử dụng được"
  ],
  [
    "显示桌面图标",
    "Hiển thị biểu tượng desktop"
  ],
  [
    "图标已显示",
    "Đã hiện biểu tượng"
  ],
  [
    "锁定软件操作",
    "Khóa tương tác ứng dụng"
  ],
  [
    "软件可正常操作",
    "Có thể thao tác ứng dụng"
  ],
  [
    "桌面控制",
    "Điều khiển desktop"
  ],
  [
    "桌面模式控制器",
    "Bộ điều khiển chế độ desktop"
  ],
  [
    "桌面模式开关",
    "Bật/tắt chế độ desktop"
  ],
  [
    "打开桌面模式控制",
    "Mở điều khiển desktop"
  ],
  [
    "Esc 退出",
    "Nhấn Esc để thoát"
  ],
  [
    "把完整 Mineradio 放到 Windows 桌面；右上控制器可显示、隐藏桌面图标；Esc 退出；重启默认关闭",
    "Đưa Mineradio lên desktop Windows; bật/tắt biểu tượng bằng bảng góc phải, Esc để thoát; mặc định tắt khi khởi động lại"
  ],
  [
    "音频路由",
    "Định tuyến âm thanh"
  ],
  [
    "音频输出",
    "Đầu ra âm thanh"
  ],
  [
    "输出设备",
    "Thiết bị đầu ra"
  ],
  [
    "无设备",
    "Không có thiết bị"
  ],
  [
    "保持",
    "Giữ nguyên"
  ],
  [
    "移除",
    "Loại bỏ"
  ],
  [
    "清理",
    "Dọn dẹp"
  ],
  [
    "应用",
    "Áp dụng"
  ],
  [
    "提示",
    "Thông báo"
  ],
  [
    "警告",
    "Cảnh báo"
  ],
  [
    "错误",
    "Lỗi"
  ],
  [
    "成功",
    "Thành công"
  ],
  [
    "正在启动播放器",
    "Đang khởi động trình phát nhạc"
  ],
  [
    "这里支持上传歌曲，也可以给当前曲目换自定义封面。",
    "Có thể tải bài hát lên và thay ảnh bìa của bài đang phát."
  ],
  [
    "“让今天的声音，从你喜欢的地方开始。”",
    "“Hãy bắt đầu âm nhạc hôm nay từ nơi bạn yêu thích.”"
  ],
  [
    "0 首",
    "0 bài"
  ],
  [
    "0 分钟",
    "0 phút"
  ],
  [
    "0 秒",
    "0 giây"
  ],
  [
    "窗口控制",
    "Điều khiển cửa sổ"
  ],
  [
    "window controls",
    "Điều khiển cửa sổ"
  ],
  [
    "Guide",
    "Hướng dẫn"
  ],
  [
    "private visual radio",
    "Không gian âm nhạc riêng"
  ],
  [
    "Color",
    "Màu sắc"
  ],
  [
    "LOGIN COOKIE",
    "COOKIE ĐĂNG NHẬP"
  ],
  [
    "NEXT UP · 接下来播放",
    "TIẾP THEO · Sắp phát"
  ],
  [
    "DISCOVER · 音乐发现",
    "KHÁM PHÁ · Âm nhạc"
  ],
  [
    "FOR YOU · 为你挑选",
    "DÀNH CHO BẠN · Gợi ý"
  ],
  [
    "PLATFORM PICKS · 平台推荐",
    "ĐỀ XUẤT · Nền tảng"
  ],
  [
    "LISTENING TODAY · 今日聆听",
    "HÔM NAY · Đã nghe"
  ],
  [
    "MINERADIO VISUALS · 鼠标移开自动隐藏",
    "HIỆU ỨNG MINERADIO · Tự ẩn khi rời chuột"
  ]
];
  const exact = Object.freeze(Object.fromEntries(entries));
  const CJK = /[\u3400-\u9fff]/;
  const templates = [
    [/^(\d+)\s*首$/, '$1 bài'],
    [/^(\d+)\s*分钟$/, '$1 phút'],
    [/^(\d+)\s*秒$/, '$1 giây'],
    [/^(\d+)\s*首歌曲$/, '$1 bài hát'],
    [/^正在搜索[\s“\"]+(.+?)[”\"]?…?$/, 'Đang tìm “$1”…'],
    [/^继续滚动加载\s*·\s*当前还有\s*(\d+)\s*首?$/, 'Cuộn để tải thêm · Còn $1 bài']
  ];
  function translate(input) {
    if (typeof input !== 'string') return input;
    const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(input);
    if (!match) return input;
    const middle = match[2];
    const trimmed = middle.trim();
    let output = Object.prototype.hasOwnProperty.call(exact, trimmed) ? exact[trimmed] : null;
    if (!output && CJK.test(trimmed)) {
      for (const [pattern, replacement] of templates) {
        if (pattern.test(trimmed)) { output = trimmed.replace(pattern, replacement); break; }
      }
    }
    return output ? match[1] + output + match[3] : input;
  }
  return Object.freeze({ version: 'vi-VN.1', exact, translate, isChinese: text => typeof text === 'string' && CJK.test(text) });
});
