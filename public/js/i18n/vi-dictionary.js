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
  ],
  [
    "查看偏好",
    "Xem sở thích"
  ],
  [
    "点击专辑封面任意位置取色，或使用下方推荐色。",
    "Nhấp vị trí bất kỳ trên bìa để lấy màu, hoặc chọn màu gợi ý bên dưới."
  ],
  [
    "背景媒体",
    "Ảnh/video nền"
  ],
  [
    "未设置",
    "Chưa thiết lập"
  ],
  [
    "裁切",
    "Cắt"
  ],
  [
    "未启用 · 原背景保留",
    "Chưa bật · Giữ nền gốc"
  ],
  [
    "识别 / 导入",
    "Phát hiện / Nhập"
  ],
  [
    "WE 壁纸透明度",
    "Độ trong suốt hình nền WE"
  ],
  [
    "WE 水平位置",
    "Vị trí ngang WE"
  ],
  [
    "WE 垂直位置",
    "Vị trí dọc WE"
  ],
  [
    "WE 壁纸缩放",
    "Thu phóng hình nền WE"
  ],
  [
    "控制台玻璃色差",
    "Hiệu ứng kính bảng điều khiển"
  ],
  [
    "左栏雾面",
    "Làm mờ thanh bên trái"
  ],
  [
    "左栏遮挡",
    "Che thanh bên trái"
  ],
  [
    "左栏唤出",
    "Mở thanh bên trái"
  ],
  [
    "左栏收起",
    "Thu thanh bên trái"
  ],
  [
    "主控",
    "Điều khiển chính"
  ],
  [
    "立体感",
    "Chiều sâu 3D"
  ],
  [
    "封面清晰度",
    "Độ nét ảnh bìa"
  ],
  [
    "镜头晃动",
    "Lắc camera"
  ],
  [
    "亮底避光",
    "Giảm chói trên nền sáng"
  ],
  [
    "音域地形",
    "Địa hình theo dải tần"
  ],
  [
    "地面起伏",
    "Độ nhấp nhô địa hình"
  ],
  [
    "起伏速度",
    "Tốc độ nhấp nhô"
  ],
  [
    "地形密度",
    "Mật độ địa hình"
  ],
  [
    "地面范围",
    "Phạm vi địa hình"
  ],
  [
    "歌词避让",
    "Tránh che lời bài hát"
  ],
  [
    "地面远近",
    "Khoảng cách địa hình"
  ],
  [
    "地形自转",
    "Địa hình tự xoay"
  ],
  [
    "音域频谱",
    "Phổ tần âm thanh"
  ],
  [
    "实时频谱",
    "Phổ tần thời gian thực"
  ],
  [
    "Kick 自动",
    "Tự động theo nhịp kick"
  ],
  [
    "频谱面板",
    "Bảng phổ tần"
  ],
  [
    "Kick 灵敏",
    "Độ nhạy kick"
  ],
  [
    "范围起点",
    "Điểm đầu phạm vi"
  ],
  [
    "范围终点",
    "Điểm cuối phạm vi"
  ],
  [
    "触发阈值",
    "Ngưỡng kích hoạt"
  ],
  [
    "触发力度",
    "Cường độ kích hoạt"
  ],
  [
    "中心低频",
    "Âm trầm trung tâm"
  ],
  [
    "低频重量",
    "Sức nặng âm trầm"
  ],
  [
    "慢波流动",
    "Dòng sóng chậm"
  ],
  [
    "方向流",
    "Hướng chuyển động"
  ],
  [
    "尖峰",
    "Đỉnh nhọn"
  ],
  [
    "闪光触发",
    "Kích hoạt chớp sáng"
  ],
  [
    "边缘微闪",
    "Nhấp nháy viền"
  ],
  [
    "空气颗粒",
    "Hạt trong không khí"
  ],
  [
    "音域颜色",
    "Màu theo dải tần"
  ],
  [
    "音域光强",
    "Cường độ sáng theo tần"
  ],
  [
    "音域方块",
    "Khối 3D theo âm thanh"
  ],
  [
    "浮空方块",
    "Khối bay"
  ],
  [
    "方块数量",
    "Số lượng khối"
  ],
  [
    "方块强度",
    "Cường độ khối"
  ],
  [
    "方块小值",
    "Giá trị nhỏ nhất"
  ],
  [
    "方块大值",
    "Giá trị lớn nhất"
  ],
  [
    "方块速度",
    "Tốc độ khối"
  ],
  [
    "音域回响·WE",
    "Vang âm · WE"
  ],
  [
    "输入压制",
    "Giảm tín hiệu đầu vào"
  ],
  [
    "音频响应",
    "Phản ứng theo âm thanh"
  ],
  [
    "响应范围",
    "Phạm vi phản ứng"
  ],
  [
    "中心高光",
    "Vùng sáng trung tâm"
  ],
  [
    "珊瑚",
    "San hô"
  ],
  [
    "深海",
    "Biển sâu"
  ],
  [
    "冰蓝",
    "Xanh băng"
  ],
  [
    "翠绿",
    "Xanh ngọc"
  ],
  [
    "极简",
    "Tối giản"
  ],
  [
    "颜色 / 来源 / 位置",
    "Màu / Nguồn / Vị trí"
  ],
  [
    "歌词颜色",
    "Màu lời bài hát"
  ],
  [
    "高亮颜色",
    "Màu tô sáng"
  ],
  [
    "跟随",
    "Theo"
  ],
  [
    "溢光颜色",
    "Màu phát sáng"
  ],
  [
    "链接",
    "Liên kết"
  ],
  [
    "歌词源",
    "Nguồn lời bài hát"
  ],
  [
    "原词",
    "Lời gốc"
  ],
  [
    "三行",
    "Ba dòng"
  ],
  [
    "沉浸",
    "Đắm chìm"
  ],
  [
    "自定",
    "Tự đặt"
  ],
  [
    "双语翻译",
    "Dịch song ngữ"
  ],
  [
    "多行",
    "Nhiều dòng"
  ],
  [
    "漂浮",
    "Lơ lửng"
  ],
  [
    "柔滑",
    "Mượt mà"
  ],
  [
    "玻璃",
    "Kính"
  ],
  [
    "线光",
    "Ánh sáng đường nét"
  ],
  [
    "故障",
    "Glitch"
  ],
  [
    "跟随鼓点故障",
    "Glitch theo nhịp trống"
  ],
  [
    "故障强度",
    "Cường độ glitch"
  ],
  [
    "切片幅度",
    "Biên độ cắt mảnh"
  ],
  [
    "色散强度",
    "Cường độ tán sắc"
  ],
  [
    "触发速度",
    "Tốc độ kích hoạt"
  ],
  [
    "抖动幅度",
    "Biên độ rung"
  ],
  [
    "上下句清晰",
    "Độ rõ dòng trên/dưới"
  ],
  [
    "上下句间距",
    "Khoảng cách dòng trên/dưới"
  ],
  [
    "译文间距",
    "Khoảng cách bản dịch"
  ],
  [
    "边缘渐隐",
    "Mờ dần ở viền"
  ],
  [
    "动画柔顺",
    "Độ mượt chuyển động"
  ],
  [
    "歌词字体",
    "Phông lời bài hát"
  ],
  [
    "标清",
    "Tiêu chuẩn"
  ],
  [
    "高清",
    "Sắc nét"
  ],
  [
    "超清",
    "Siêu nét"
  ],
  [
    "极致",
    "Tối đa"
  ],
  [
    "黑体",
    "Phông không chân"
  ],
  [
    "宋体",
    "Phông Song"
  ],
  [
    "粗宋",
    "Song đậm"
  ],
  [
    "石印宋",
    "Song kiểu in đá"
  ],
  [
    "楷宋",
    "Khải thư"
  ],
  [
    "等宽",
    "Đơn cách"
  ],
  [
    "标题",
    "Tiêu đề"
  ],
  [
    "上传字体",
    "Tải phông chữ"
  ],
  [
    "字间距",
    "Khoảng cách ký tự"
  ],
  [
    "行距",
    "Khoảng cách dòng"
  ],
  [
    "字重",
    "Độ đậm chữ"
  ],
  [
    "歌词布局",
    "Bố cục lời bài hát"
  ],
  [
    "歌词大小",
    "Cỡ lời bài hát"
  ],
  [
    "水平位置",
    "Vị trí ngang"
  ],
  [
    "垂直位置",
    "Vị trí dọc"
  ],
  [
    "景深位置",
    "Vị trí chiều sâu"
  ],
  [
    "上下角度",
    "Góc dọc"
  ],
  [
    "左右角度",
    "Góc ngang"
  ],
  [
    "叠加效果",
    "Hiệu ứng lớp phủ"
  ],
  [
    "粒子 / 镜头 / 溢光",
    "Hạt / Camera / Ánh sáng"
  ],
  [
    "浮空粒子层",
    "Lớp hạt lơ lửng"
  ],
  [
    "电影镜头",
    "Camera điện ảnh"
  ],
  [
    "鼓点溢光",
    "Ánh sáng theo nhịp trống"
  ],
  [
    "歌词光粒",
    "Hạt sáng của lời"
  ],
  [
    "背景星河",
    "Dải sao nền"
  ],
  [
    "歌词上下浮动",
    "Lời trôi lên xuống"
  ],
  [
    "暂停保留歌词",
    "Giữ lời khi tạm dừng"
  ],
  [
    "歌词镜头绑定",
    "Gắn lời với camera"
  ],
  [
    "粒子溢光",
    "Ánh sáng hạt"
  ],
  [
    "轮廓高亮",
    "Tô sáng đường viền"
  ],
  [
    "桌面歌词锁定",
    "Khóa lời trên desktop"
  ],
  [
    "桌面歌词电影震动",
    "Rung lời kiểu điện ảnh"
  ],
  [
    "桌面歌词高亮跟随",
    "Tô sáng lời theo tiến độ"
  ],
  [
    "完整桌面模式",
    "Chế độ desktop đầy đủ"
  ],
  [
    "试验",
    "Thử nghiệm"
  ],
  [
    "桌面 / 壁纸",
    "Desktop / Hình nền"
  ],
  [
    "桌面歌词大小",
    "Cỡ lời desktop"
  ],
  [
    "桌面歌词透明",
    "Độ trong suốt lời desktop"
  ],
  [
    "桌面歌词高度",
    "Độ cao lời desktop"
  ],
  [
    "桌面帧数",
    "FPS desktop"
  ],
  [
    "无上限",
    "Không giới hạn"
  ],
  [
    "开启后可在右上控制器显示或隐藏 Windows 桌面图标；按 Esc 直接退出。重启默认关闭。",
    "Khi bật, dùng bảng góc phải để ẩn/hiện biểu tượng desktop. Nhấn Esc để thoát. Mặc định tắt khi khởi động lại."
  ],
  [
    "壁纸帧数",
    "FPS hình nền"
  ],
  [
    "壁纸透明度",
    "Độ trong suốt hình nền"
  ],
  [
    "3D / 手势",
    "3D / Cử chỉ"
  ],
  [
    "歌单架 / 摄像头交互",
    "Kệ nhạc / Tương tác camera"
  ],
  [
    "侧栏",
    "Thanh bên"
  ],
  [
    "舞台",
    "Sân khấu"
  ],
  [
    "动态镜头",
    "Camera động"
  ],
  [
    "静态镜头",
    "Camera tĩnh"
  ],
  [
    "自动隐藏",
    "Tự động ẩn"
  ],
  [
    "常驻",
    "Luôn hiện"
  ],
  [
    "歌单架内容",
    "Nội dung kệ nhạc"
  ],
  [
    "显示播客歌单",
    "Hiển thị danh sách podcast"
  ],
  [
    "合并收藏歌单",
    "Gộp danh sách yêu thích"
  ],
  [
    "歌单架大小",
    "Kích thước kệ nhạc"
  ],
  [
    "侧向角度",
    "Góc nghiêng bên"
  ],
  [
    "整体透明度",
    "Độ trong suốt tổng thể"
  ],
  [
    "详情左右",
    "Chi tiết ngang"
  ],
  [
    "详情上下",
    "Chi tiết dọc"
  ],
  [
    "详情前后",
    "Chi tiết chiều sâu"
  ],
  [
    "详情大小",
    "Kích thước chi tiết"
  ],
  [
    "详情俯仰",
    "Góc ngẩng/nghiêng"
  ],
  [
    "详情侧旋",
    "Góc xoay ngang"
  ],
  [
    "详情行间距",
    "Khoảng cách dòng chi tiết"
  ],
  [
    "展开秒数",
    "Thời gian mở (giây)"
  ],
  [
    "关闭秒数",
    "Thời gian đóng (giây)"
  ],
  [
    "行入场秒数",
    "Thời gian hiện dòng (giây)"
  ],
  [
    "展开位移",
    "Khoảng dịch khi mở"
  ],
  [
    "悬浮视差",
    "Thị sai khi di chuột"
  ],
  [
    "唤出秒数",
    "Thời gian gọi ra (giây)"
  ],
  [
    "收起秒数",
    "Thời gian thu lại (giây)"
  ],
  [
    "唤出位移",
    "Khoảng dịch khi gọi ra"
  ],
  [
    "卡片错层",
    "Độ lệch lớp thẻ"
  ],
  [
    "唤出缩放",
    "Thu phóng lúc mở"
  ],
  [
    "唤出视差",
    "Thị sai lúc mở"
  ],
  [
    "镜头进入速度",
    "Tốc độ vào của camera"
  ],
  [
    "镜头离开速度",
    "Tốc độ rời của camera"
  ],
  [
    "手势触碰",
    "Chạm bằng cử chỉ"
  ],
  [
    "播放手势",
    "Cử chỉ phát nhạc"
  ],
  [
    "稳定保持才执行，降低误触",
    "Giữ ổn định trước khi thực hiện để tránh nhầm"
  ],
  [
    "播放器动作",
    "Thao tác trình phát"
  ],
  [
    "手部光迹",
    "Vệt sáng bàn tay"
  ],
  [
    "识别灵敏度",
    "Độ nhạy nhận diện"
  ],
  [
    "稳健",
    "Ổn định"
  ],
  [
    "均衡",
    "Cân bằng"
  ],
  [
    "灵敏",
    "Nhạy"
  ],
  [
    "播放 / 暂停",
    "Phát / Tạm dừng"
  ],
  [
    "快速滑动",
    "Vuốt nhanh"
  ],
  [
    "上一首 / 下一首",
    "Bài trước / Bài tiếp"
  ],
  [
    "保持并上下",
    "Giữ và di chuyển lên/xuống"
  ],
  [
    "喜欢歌曲",
    "Yêu thích bài hát"
  ],
  [
    "三指保持",
    "Giữ ba ngón tay"
  ],
  [
    "歌词显隐",
    "Ẩn/hiện lời bài hát"
  ],
  [
    "张掌 / 捏合 / 握拳",
    "Xòe tay / Chụm tay / Nắm tay"
  ],
  [
    "粒子交互",
    "Tương tác hạt"
  ],
  [
    "高级参数",
    "Thông số nâng cao"
  ],
  [
    "直播 / 后台",
    "Trình chiếu / Chạy nền"
  ],
  [
    "自动优化",
    "Tự tối ưu"
  ],
  [
    "保持运行",
    "Tiếp tục chạy"
  ],
  [
    "停止释放",
    "Dừng và giải phóng"
  ],
  [
    "直接退出",
    "Thoát ngay"
  ],
  [
    "后台托盘",
    "Khay hệ thống"
  ],
  [
    "启动播放",
    "Tự phát khi mở"
  ],
  [
    "启动自动播放",
    "Tự động phát khi khởi động"
  ],
  [
    "秒启动跳过启动页",
    "Bỏ qua màn hình khởi động"
  ],
  [
    "按上次进度",
    "Phát từ vị trí trước"
  ],
  [
    "重播整首",
    "Phát lại từ đầu"
  ],
  [
    "输出接口",
    "Giao diện đầu ra"
  ],
  [
    "播放输出设备",
    "Thiết bị phát nhạc"
  ],
  [
    "面板",
    "Bảng điều khiển"
  ],
  [
    "画质档位",
    "Mức chất lượng hình"
  ],
  [
    "跟随屏幕",
    "Theo màn hình"
  ],
  [
    "实时视觉性能",
    "Hiệu năng hình ảnh trực tiếp"
  ],
  [
    "歌词实时边界",
    "Giới hạn lời thời gian thực"
  ],
  [
    "上下句高清纹理",
    "Texture nét cao cho các dòng gần"
  ],
  [
    "全局歌词避光",
    "Chống chói lời toàn cảnh"
  ],
  [
    "封面粒子避光",
    "Giảm chói hạt bìa"
  ],
  [
    "直播后台保持",
    "Giữ hiệu ứng khi chạy nền"
  ],
  [
    "内存压缩 / Mem Reduct",
    "Nén bộ nhớ / Mem Reduct"
  ],
  [
    "系统内存读取中...",
    "Đang đọc bộ nhớ hệ thống..."
  ],
  [
    "后台先压缩播放器进程；系统级释放可清工作集、修改页、待机页",
    "Ưu tiên nén tiến trình khi chạy nền; dọn RAM hệ thống có thể giải phóng working set và bộ nhớ chờ"
  ],
  [
    "自动压缩播放器",
    "Tự động nén bộ nhớ ứng dụng"
  ],
  [
    "后台触发压缩",
    "Nén khi chạy nền"
  ],
  [
    "系统级定时释放",
    "Định kỳ giải phóng RAM hệ thống"
  ],
  [
    "需要时请求管理员",
    "Yêu cầu quản trị khi cần"
  ],
  [
    "工作集",
    "Working set"
  ],
  [
    "修改页",
    "Trang đã sửa"
  ],
  [
    "待机页",
    "Trang chờ"
  ],
  [
    "低优先待机",
    "Trang chờ ưu tiên thấp"
  ],
  [
    "定时释放(分)",
    "Chu kỳ dọn (phút)"
  ],
  [
    "占用阈值(%)",
    "Ngưỡng sử dụng (%)"
  ],
  [
    "压缩播放器",
    "Nén ứng dụng"
  ],
  [
    "系统释放",
    "Giải phóng hệ thống"
  ],
  [
    "提权释放",
    "Giải phóng bằng quyền quản trị"
  ],
  [
    "本地缓存",
    "Bộ nhớ đệm cục bộ"
  ],
  [
    "统一缓存目录",
    "Thư mục cache chung"
  ],
  [
    "读取中...",
    "Đang đọc..."
  ],
  [
    "桌面版启动后读取",
    "Đọc khi mở ứng dụng desktop"
  ],
  [
    "更改目录",
    "Đổi thư mục"
  ],
  [
    "刷新占用",
    "Làm mới dung lượng"
  ],
  [
    "重启生效",
    "Có hiệu lực sau khi khởi động lại"
  ],
  [
    "歌词 / 译文缓存",
    "Cache lời / bản dịch"
  ],
  [
    "封面、网络与音频分片缓存",
    "Cache ảnh bìa, mạng và đoạn âm thanh"
  ],
  [
    "节奏分析缓存",
    "Cache phân tích nhịp"
  ],
  [
    "Wallpaper Engine 静音场景缓存",
    "Cache cảnh Wallpaper Engine tắt tiếng"
  ],
  [
    "设置与登录资料（安全固定）",
    "Cài đặt và đăng nhập (lưu cố định)"
  ],
  [
    "歌词缓存立即切换；网络、节奏分析与 WE 静音场景缓存目录在下次重启后切换。",
    "Cache lời đổi ngay; cache mạng, nhịp và cảnh WE chuyển sau khi khởi động lại."
  ],
  [
    "粒子尺寸",
    "Kích thước hạt"
  ],
  [
    "流速",
    "Tốc độ dòng chảy"
  ],
  [
    "扭曲",
    "Biến dạng"
  ],
  [
    "色彩张力",
    "Cường độ màu sắc"
  ],
  [
    "溢光强度",
    "Cường độ phát sáng"
  ],
  [
    "离散感",
    "Độ phân tán"
  ],
  [
    "背景压缩",
    "Nén nền"
  ],
  [
    "歌单 / 队列",
    "Danh sách / Hàng đợi"
  ],
  [
    "QUEUE · 鼠标移开自动隐藏",
    "HÀNG ĐỢI · Tự ẩn khi rời chuột"
  ],
  [
    "我的播客",
    "Podcast của tôi"
  ],
  [
    "切换模式",
    "Đổi chế độ"
  ],
  [
    "内置歌单可混合全部平台",
    "Danh sách tích hợp có thể trộn bài từ nhiều nền tảng"
  ],
  [
    "+ 新建内置",
    "+ Tạo danh sách mới"
  ],
  [
    "收藏 / 创建 / 喜欢",
    "Yêu thích / Tạo / Lưu"
  ],
  [
    "仅播放试听片段",
    "Chỉ phát đoạn nghe thử"
  ],
  [
    "AI 深度估计…",
    "AI đang ước lượng độ sâu…"
  ],
  [
    "分析节奏…",
    "Đang phân tích nhịp…"
  ],
  [
    "手势：",
    "Cử chỉ:"
  ],
  [
    "待命",
    "Sẵn sàng"
  ],
  [
    "将手放进摄像头视野",
    "Đưa tay vào vùng nhìn của camera"
  ],
  [
    "张掌推开 · 捏合旋转 · 握拳收束 · 左右滑切歌 · V 手势播放 · 食指音量 · 拇指喜欢 · 三指歌词",
    "Xòe tay đẩy ra · Chụm tay xoay · Nắm tay thu lại · Vuốt đổi bài · Chữ V phát nhạc · Trỏ điều chỉnh âm lượng · Ngón cái yêu thích · Ba ngón xem lời"
  ],
  [
    "歌词校准",
    "Hiệu chỉnh lời"
  ],
  [
    "淡入",
    "Tăng dần âm lượng"
  ],
  [
    "淡出",
    "Giảm dần âm lượng"
  ],
  [
    "拖放音乐或封面",
    "Thả nhạc hoặc ảnh bìa vào đây"
  ],
  [
    "R 固定/退出 · WASD 移动 · 鼠标转向 · Shift 加速 · Space/Ctrl 升降 · Q/E 轻微旋转 · 滚轮景深 · K 回正",
    "R khóa/thoát · WASD di chuyển · Chuột đổi hướng · Shift tăng tốc · Space/Ctrl lên/xuống · Q/E xoay nhẹ · Con lăn chỉnh độ sâu · K đặt lại"
  ],
  [
    "登录接入",
    "Kết nối đăng nhập"
  ],
  [
    "拖接口端口到 MR",
    "Kéo cổng kết nối vào MR"
  ],
  [
    "心愿是",
    "Điều ước là"
  ],
  [
    "官方窗口 / Cookie",
    "Cửa sổ chính thức / Cookie"
  ],
  [
    "官方扫码 / 抖音确认",
    "Quét QR chính thức / Xác nhận Douyin"
  ],
  [
    "等待接入",
    "Đang chờ kết nối"
  ],
  [
    "扫码",
    "Quét mã"
  ],
  [
    "官方窗口",
    "Cửa sổ chính thức"
  ],
  [
    "保存会话",
    "Lưu phiên đăng nhập"
  ],
  [
    "扫码登录网易云音乐",
    "Quét QR đăng nhập NetEase Music"
  ],
  [
    "使用",
    "Sử dụng"
  ],
  [
    "网易云音乐 App",
    "Ứng dụng NetEase Music"
  ],
  [
    "扫码，可同步歌单、红心与播客。",
    "Quét mã để đồng bộ danh sách, yêu thích và podcast."
  ],
  [
    "拖动接口到 MR 接入口后开始登录。",
    "Kéo kết nối tới vùng nhập MR để đăng nhập."
  ],
  [
    "打开官方扫码窗口",
    "Mở cửa sổ quét QR chính thức"
  ],
  [
    "从 y.qq.com 的登录会话导入。",
    "Nhập phiên đăng nhập từ y.qq.com."
  ],
  [
    "先搜索一首歌",
    "Hãy tìm một bài hát trước"
  ],
  [
    "手动导入",
    "Nhập thủ công"
  ],
  [
    "开始登录",
    "Bắt đầu đăng nhập"
  ],
  [
    "已达成成就",
    "Đã đạt thành tựu"
  ],
  [
    "世界和平！",
    "Hòa bình thế giới!"
  ],
  [
    "系统默认",
    "Mặc định hệ thống"
  ],
  [
    "刷新接口",
    "Làm mới kết nối"
  ],
  [
    "账号信息",
    "Thông tin tài khoản"
  ],
  [
    "我两个都要",
    "Tôi muốn cả hai"
  ],
  [
    "补登网易云",
    "Đăng nhập thêm NetEase"
  ],
  [
    "补登 QQ 音乐",
    "Đăng nhập thêm QQ Music"
  ],
  [
    "补登酷狗音乐",
    "Đăng nhập thêm Kugou"
  ],
  [
    "登录汽水音乐",
    "Đăng nhập Qishui Music"
  ],
  [
    "QQ 音乐真实登录暂未接入，当前先预览双平台账号交互。",
    "Đăng nhập QQ Music chưa hoàn thiện; đang xem thử giao diện hai nền tảng."
  ],
  [
    "退出当前平台",
    "Đăng xuất nền tảng hiện tại"
  ],
  [
    "裁剪封面",
    "Cắt ảnh bìa"
  ],
  [
    "使用封面",
    "Dùng ảnh bìa"
  ],
  [
    "裁切背景媒体",
    "Cắt ảnh/video nền"
  ],
  [
    "拖动预览调整位置",
    "Kéo hình xem trước để chỉnh vị trí"
  ],
  [
    "复位",
    "Đặt lại"
  ],
  [
    "使用裁切",
    "Áp dụng vùng cắt"
  ],
  [
    "Wallpaper Engine 壁纸导入",
    "Nhập hình nền Wallpaper Engine"
  ],
  [
    "只建立本地索引，不复制大型项目；Video 直接播放，Scene 项目与有效 PKGV 场景包由本机 Wallpaper Engine 原生引擎实时运行。",
    "Chỉ lập chỉ mục cục bộ, không sao chép dự án lớn; Video phát trực tiếp, Scene và PKGV chạy bằng Wallpaper Engine có sẵn."
  ],
  [
    "导入项目 / 场景包",
    "Nhập dự án / gói cảnh"
  ],
  [
    "导入目录",
    "Nhập thư mục"
  ],
  [
    "刷新识别",
    "Làm mới nhận diện"
  ],
  [
    "恢复隐藏",
    "Hiện lại mục đã ẩn"
  ],
  [
    "等待识别本机 Wallpaper Engine 库",
    "Đang tìm thư viện Wallpaper Engine trên máy"
  ],
  [
    "项目设置",
    "Cài đặt dự án"
  ],
  [
    "在 WE 中打开设置（实验）",
    "Mở cài đặt trong WE (thử nghiệm)"
  ],
  [
    "创意工坊详情",
    "Chi tiết Workshop"
  ],
  [
    "每次载入自动应用静音值（音量 0 / 静音开启 / 音频关闭）；Scene 包只处理缓存副本，原文件不变。其他视觉设置仍由 Wallpaper Engine 管理。",
    "Tự tắt tiếng khi tải (âm lượng 0); chỉ chỉnh bản cache Scene, không sửa tệp gốc. Các cài đặt khác thuộc Wallpaper Engine."
  ],
  [
    "创建内置",
    "Tạo danh sách tích hợp"
  ],
  [
    "本地节奏分析",
    "Phân tích nhịp cục bộ"
  ],
  [
    "本地歌曲",
    "Bài hát trong máy"
  ],
  [
    "选择一种电影视角分析方式",
    "Chọn cách phân tích camera điện ảnh"
  ],
  [
    "MR 分析",
    "Phân tích MR"
  ],
  [
    "日常电影视角",
    "Camera điện ảnh thường"
  ],
  [
    "DJ 分析",
    "Phân tích DJ"
  ],
  [
    "长混音/强节奏",
    "Mix dài / Nhịp mạnh"
  ],
  [
    "暂不分析",
    "Bỏ qua phân tích"
  ],
  [
    "开始分析",
    "Bắt đầu phân tích"
  ],
  [
    "自定义歌词",
    "Lời bài hát tùy chỉnh"
  ],
  [
    "支持 LRC 时间轴，也可以直接输入纯文本歌词",
    "Hỗ trợ thời gian LRC hoặc nhập lời văn bản thường"
  ],
  [
    "保存使用",
    "Lưu và sử dụng"
  ],
  [
    "请以本次发布公告中的最新网盘链接为准。",
    "Vui lòng sử dụng liên kết tải mới nhất trong thông báo phát hành."
  ],
  [
    "查看更新页面",
    "Xem trang cập nhật"
  ],
  [
    "将在浏览器打开下载页面，软件不会在本地下载或应用补丁。",
    "Mở trang tải trong trình duyệt; ứng dụng không tự tải hay cài bản vá."
  ],
  [
    "这次自动过渡顺滑吗？",
    "Chuyển bài tự động có mượt không?"
  ],
  [
    "顺滑",
    "Mượt"
  ],
  [
    "生硬",
    "Giật, cứng"
  ],
  [
    "不确定",
    "Không chắc"
  ],
  [
    "导入面板",
    "Bảng nhập dữ liệu"
  ],
  [
    "关闭提示",
    "Đóng thông báo"
  ],
  [
    "Mineradio 音乐首页",
    "Trang chủ âm nhạc Mineradio"
  ],
  [
    "常用音乐入口",
    "Lối tắt nghe nhạc"
  ],
  [
    "今日聆听和音乐发现",
    "Nghe hôm nay và khám phá"
  ],
  [
    "播放下一首",
    "Phát bài tiếp theo"
  ],
  [
    "为你挑选",
    "Dành cho bạn"
  ],
  [
    "打开音乐发现",
    "Mở khám phá âm nhạc"
  ],
  [
    "打开平台推荐",
    "Mở gợi ý nền tảng"
  ],
  [
    "关闭平台推荐",
    "Đóng gợi ý nền tảng"
  ],
  [
    "推荐平台",
    "Nền tảng đề xuất"
  ],
  [
    "歌词纹理清晰度",
    "Độ nét texture lời bài hát"
  ],
  [
    "1 倍基础纹理，节省显存，适合低配设备或超长歌词",
    "Texture 1× tiết kiệm VRAM, hợp máy yếu hoặc lời dài"
  ],
  [
    "2 倍可见歌词纹理，兼顾清晰度与流畅度",
    "Texture 2× cân bằng nét và mượt"
  ],
  [
    "3 倍可见歌词纹理，适合大屏或歌词放大",
    "Texture 3× hợp màn hình lớn hoặc lời phóng to"
  ],
  [
    "4 倍可见歌词纹理，使用受控高清缓存以保护显存",
    "Texture 4× dùng cache kiểm soát để tránh tốn VRAM"
  ],
  [
    "全屏幕置顶歌词",
    "Lời bài hát nổi toàn màn hình"
  ],
  [
    "把当前完整 Mineradio 放到 Windows 桌面；右上控制器可显示、隐藏桌面图标，Esc 退出",
    "Đưa toàn bộ Mineradio lên desktop; bảng góc phải ẩn/hiện biểu tượng, Esc để thoát"
  ],
  [
    "关闭后 3D 歌单架不显示播客收藏",
    "Khi tắt, kệ 3D không hiện podcast yêu thích"
  ],
  [
    "开启后我的歌单与收藏歌单按一条线连续滚动",
    "Khi bật, danh sách của tôi và đã lưu cuộn liên tục cùng nhau"
  ],
  [
    "控制窗口隐藏、最小化或后台运行时的渲染策略",
    "Điều chỉnh vẽ hình khi cửa sổ bị ẩn, thu nhỏ hoặc chạy nền"
  ],
  [
    "点击右上角关闭按钮时的行为",
    "Hành vi khi bấm nút đóng góc trên phải"
  ],
  [
    "打开软件后从上次保存进度自动继续播放",
    "Tự tiếp tục từ vị trí đã lưu khi mở ứng dụng"
  ],
  [
    "打开软件后直接进入主页，不等待启动动画",
    "Vào trang chủ ngay, bỏ qua hiệu ứng khởi động"
  ],
  [
    "控制恢复上次播放时从哪里开始",
    "Chọn vị trí bắt đầu khi khôi phục phát nhạc"
  ],
  [
    "控制可见状态下的渲染像素预算，重启后保留",
    "Giới hạn pixel khi hiển thị, giữ thiết lập sau khi khởi động"
  ],
  [
    "默认跟随屏幕垂直同步；固定档位用于节能或降低负载",
    "Mặc định đồng bộ màn hình; chọn FPS cố định để tiết kiệm điện"
  ],
  [
    "逐帧读取歌词在屏幕两侧的真实余量；关闭后停止相机投影计算",
    "Đo khoảng trống hai bên lời mỗi khung hình; tắt để giảm tính toán camera"
  ],
  [
    "为可见上下句和翻译预热高清纹理；关闭后只保留当前原文和当前翻译高清",
    "Làm nóng texture nét cao cho các dòng và bản dịch đang thấy; khi tắt chỉ giữ dòng hiện tại"
  ],
  [
    "让所有可见歌词根据亮背景实时增强可读性；关闭后保留基础文字层",
    "Tăng độ rõ của lời theo nền sáng; khi tắt giữ lớp chữ cơ bản"
  ],
  [
    "在封面粒子着色器中启用亮底避光；关闭后跳过对应片元增强",
    "Giảm chói trên nền sáng trong shader hạt ảnh bìa"
  ],
  [
    "开启后后台或最小化时保持视觉渲染，不进入低占用暂停",
    "Giữ hiệu ứng khi ứng dụng chạy nền hoặc thu nhỏ"
  ],
  [
    "最小化、托盘后台或深度后台时压缩 Mineradio / Electron 工作集",
    "Nén RAM Mineradio/Electron khi thu nhỏ hoặc ở khay hệ thống"
  ],
  [
    "只在最小化、隐藏或不可见后台触发自动压缩，前台播放不打断",
    "Chỉ tự nén RAM khi ứng dụng bị ẩn, không ngắt phát nhạc ở nền trước"
  ],
  [
    "按阈值和间隔启用系统级 Mem Reduct；默认不自动弹管理员权限",
    "Dùng Mem Reduct theo chu kỳ/ngưỡng; mặc định không tự xin quyền quản trị"
  ],
  [
    "完整释放工作集/修改页/待机页可能需要 UAC；关闭时只尝试当前权限可完成的部分",
    "Dọn toàn bộ RAM có thể cần UAC; nếu tắt, chỉ làm trong quyền hiện tại"
  ],
  [
    "Mem Reduct 系统释放范围",
    "Phạm vi dọn RAM bằng Mem Reduct"
  ],
  [
    "播放器控制台",
    "Bảng điều khiển phát nhạc"
  ],
  [
    "播放顺序",
    "Thứ tự phát"
  ],
  [
    "Cuefield AutoMix（实验功能，默认关闭）",
    "Cuefield AutoMix (thử nghiệm, mặc định tắt)"
  ],
  [
    "播放/暂停",
    "Phát/Tạm dừng"
  ],
  [
    "歌词延后 0.1 秒",
    "Lùi lời bài hát 0,1 giây"
  ],
  [
    "重置当前歌曲歌词校准",
    "Đặt lại thời gian lời bài hát"
  ],
  [
    "歌词提前 0.1 秒",
    "Đưa lời sớm 0,1 giây"
  ],
  [
    "音量 / 静音",
    "Âm lượng / Tắt tiếng"
  ],
  [
    "音乐淡入秒数",
    "Thời gian tăng âm lượng (giây)"
  ],
  [
    "音乐淡出秒数",
    "Thời gian giảm âm lượng (giây)"
  ],
  [
    "控制条自动隐藏",
    "Tự ẩn thanh điều khiển"
  ],
  [
    "全沉浸式",
    "Toàn cảnh đắm chìm"
  ],
  [
    "全屏 (F)",
    "Toàn màn hình (F)"
  ],
  [
    "清除所有平台登录并重新锁定彩蛋",
    "Xóa phiên đăng nhập mọi nền tảng và khóa lại bí mật"
  ],
  [
    "轻触大小眼",
    "Chạm biểu tượng con mắt"
  ],
  [
    "输入四个字的愿望",
    "Nhập điều ước bốn chữ"
  ],
  [
    "MR 接入口",
    "Khu nhập MR"
  ],
  [
    "世界和平，点击继续",
    "Hòa bình thế giới, nhấn tiếp tục"
  ],
  [
    "已达成成就：世界和平！",
    "Đã đạt thành tựu: Hòa bình thế giới!"
  ],
  [
    "搜索壁纸名称",
    "Tìm tên hình nền"
  ],
  [
    "关闭项目设置",
    "Đóng cài đặt dự án"
  ],
  [
    "新建 Mineradio 内置歌单",
    "Tạo danh sách phát Mineradio"
  ],
  [
    "下载线路",
    "Nguồn tải xuống"
  ],
  [
    "Cuefield AutoMix 反馈",
    "Đánh giá Cuefield AutoMix"
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
