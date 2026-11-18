# Hệ thống ngôn ngữ Mineradio: zh-CN và vi-VN

**Trạng thái:** nhánh tính năng, PR Draft; chưa phát hành bộ cài Windows.

## Kiến trúc chính thức trong ứng dụng

Mineradio hiện có **hai bộ tài nguyên giao diện song song**, dùng chung các mã thông báo bền vững:

- `public/js/i18n/locales/zh-CN.js`: thông điệp giao diện gốc tiếng Trung (giữ làm bản chuẩn).
- `public/js/i18n/locales/vi-VN.js`: bản dịch tiếng Việt với cùng một tập khóa.
- `public/js/i18n/i18n.js`: quản lý ngôn ngữ dùng trong giao diện. `t(id)` trả chuỗi theo khóa đã định nghĩa; `source(chineseText)` hỗ trợ các lời nhắc giao diện cũ trong quá trình chuyển đổi mã nguồn.
- `data-i18n`, `data-i18n-title`, `data-i18n-placeholder`, `data-i18n-aria-label`, `data-i18n-alt` được đặt **trực tiếp trong mã HTML của từng thành phần**. Chúng không phải một lớp hiển thị đè lên giao diện. Tên bài hát, tác giả, lời nhạc, dữ liệu thư viện hay tên tài khoản không có các khóa này.
- Các module UI động `05-playback/07-search.js`, `05-playback/14-player-controls.js`, `07-fx/05-fx-panel-performance.js` và `09-idle-toast-libraries.js` đã có những câu hiển thị được lấy trực tiếp qua `MineradioI18n.source()`. Những thông báo khác cần tiếp tục chuyển từng chỗ sang `t(id)` khi bảo trì.

**Không còn** `MutationObserver`, chương trình quét toàn bộ chữ, nút ngôn ngữ nổi hoặc `vi-dictionary.js`/ `runtime.js`. Việc đổi ngôn ngữ chỉ cập nhật các thành phần có khai báo khóa i18n. Đây là cách hoạt động i18n được tích hợp, không dịch chồng.

## Đổi ngôn ngữ

Mở **Bảng điều khiển hiệu ứng → Ngôn ngữ giao diện** và chọn **简体中文** hoặc **Tiếng Việt**.

`MineradioI18n.setLanguage('vi-VN')` hoặc `MineradioI18n.setLanguage('zh-CN')` cập nhật ngay các nhãn đã đăng ký, không reload ứng dụng, không dừng trình phát Web Audio, FFT, camera hoặc GPU. Giá trị được giữ tại `localStorage('mineradio:language:v2')`, đồng bộ vào tùy chọn native Electron (`ui-language.json` trong thư mục dữ liệu ứng dụng) và các mục menu khay hệ thống. Có logic đọc lựa chọn `mineradio:ui-language:v1` từ bản Việt hóa cũ.

Tiếng Việt mặc định cho bản tùy chỉnh; `zh-CN` vẫn là bản gốc, không bị sửa mất nội dung.

## Dành cho nhà phát triển

Với một nhãn mới, tạo **một mã khóa** và thêm nó vào cả hai catalog:

```js
// locales/zh-CN.js
"settings.language": "界面语言"

// locales/vi-VN.js
"settings.language": "Ngôn ngữ giao diện"
```

Trong HTML:

```html
<label data-i18n="settings.language">界面语言</label>
```

Trong module dựng giao diện:

```js
label.textContent = MineradioI18n.t('settings.language');
```

Khi phần giao diện động được render:

```js
MineradioI18n.bind(sectionElement);
```

Khi ngôn ngữ thay đổi, có thể đăng ký hàm cập nhật thành phần UI (không khởi tạo lại trình phát nhạc):

```js
MineradioI18n.onChange(function () {
  updateSearchModeTabs();
});
```

**Quan trọng:** không truyền tên bài hát, lời nhạc, nghệ sĩ, kết quả API, token hay nội dung người dùng vào `source()`. Hàm `source()` chỉ dành cho chuỗi giao diện bất biến, trong giai đoạn chuyển mã sang khóa ngôn ngữ.

## Sau khi Mineradio gốc có bản cập nhật

1. Giữ `i18n.js` và hai catalog. Không chạy script dịch thay chữ trực tiếp trên mã nguồn của nhà phát hành.
2. Giữ các `data-i18n` và lời gọi `t()` tại vị trí thành phần. Khi giao diện có nhãn mới, tạo khóa mới **cùng lúc trong hai catalog**, không tạo lại khóa cũ.
3. Chạy `node --test tests/vi-i18n.test.js`; kiểm tra tập ID hai ngôn ngữ đồng nhất và số lượng nhãn HTML được đăng ký. Các thành phần mới chưa gắn ID sẽ không tự động dịch, cần tích hợp vào i18n.
4. Soát xung đột git trước khi merge các thay đổi gốc. Những chỗ giao diện gốc bị viết lại hoàn toàn vẫn có thể cần gắn ID mới; **không có cơ chế nào đảm bảo không xung đột 100% với mọi bản cập nhật**.

## Kiểm thử

```bash
node --check public/js/i18n/i18n.js
node --check public/js/i18n/locales/zh-CN.js
node --check public/js/i18n/locales/vi-VN.js
node --test tests/vi-i18n.test.js
npm start
```

Bản Linux CI kiểm tra tính nhất quán khóa, nhãn tĩnh, cập nhật giao diện, độ an toàn với tên bài hát và hồi quy phát nhạc. Chưa có kiểm thử thực tế GPU/khay hệ thống Windows hoặc rà soát toàn bộ thông báo sinh động từ JS. Một số hộp thoại native Electron và nhãn UI chưa chuyển sang khóa i18n vẫn còn tiếng Trung: đây là công việc cần hoàn thiện, không nên tuyên bố đã Việt hóa tuyệt đối.

**Giữ PR Draft, không merge vào main hay phát hành Windows cho đến khi kiểm thử trực tiếp.**

## Dịch lời bài hát theo ngôn ngữ hệ thống

Khi chọn Tiếng Việt và bật dịch song ngữ, lời chính vẫn là nguyên bản,
còn dòng phụ chỉ hiển thị lời dịch máy tiếng Việt. Dữ liệu tlyric/ytlrc do
nền tảng nhạc cung cấp không tự động được coi là tiếng Việt (thường là tiếng Trung).
Chuyển về 简体中文 tiếp tục dùng bản dịch gốc do nền tảng cung cấp.

Module 00a-localized-lyric-translation.js giữ cache theo bài hát và thời điểm
và không sửa originalLyricsState. Máy chủ có endpoint POST /api/lyrics/translate,
dịch máy bằng dịch vụ Google Translate công khai không chính thức; dịch vụ
có thể bị giới hạn hoặc không sẵn sàng. Nếu thất bại, hệ thống ẩn dòng dịch
thay vì hiển thị nhầm bản tiếng Trung. Bản dịch máy có thể không chính xác.

Quyền riêng tư: Khi bật dịch ở chế độ tiếng Việt, văn bản lời bài hát gốc
được gửi đến dịch vụ Google bên ngoài để xử lý; không gửi cookie đăng nhập
hay dữ liệu âm thanh. Người dùng có thể tắt chế độ dịch để tránh việc gửi lời.

Kiểm tra bằng: node --test tests/vi-lyrics-translation.test.js

## Bổ sung: nội dung tiếng Việt và lời dịch đồng bộ

- Bản hiển thị mặc định (trình phát, khởi động, lời trên desktop) được đánh dấu `vi-VN`. Các văn bản placeholder tĩnh trước đây còn tiếng Trung đã chuyển sang tiếng Việt. Chuỗi `data-i18n` vẫn được giữ để cho phép đổi locale mà không tải lại bài hát.
- Trạng thái đăng nhập QR và bảng tài khoản được Việt hóa ngay khi nội dung được cập nhật, không dịch tên người dùng. Tên bài, nghệ sĩ, playlist nhập từ dịch vụ hoặc dữ liệu người dùng vẫn giữ nguyên.
- Ở chế độ tiếng Việt và bật **Dịch song ngữ**, mỗi dòng lời gốc có mốc thời gian thật được ghép với dòng dịch máy tiếng Việt bằng cùng thời điểm `t`. Bài hát dài được dịch theo từng lô (tối đa 90 dòng/lô) để không mất lời sau dòng 180. Ứng dụng hiển thị dần bản dịch mà không thay đổi karaoke gốc hay đồng bộ phát nhạc.
- Nếu dịch vụ không phản hồi, vẫn giữ lời gốc; bản dịch không được giả lập. Tính năng này sử dụng dịch vụ dịch trực tuyến không chính thức, nên phụ thuộc kết nối và có thể sai về ngữ nghĩa.
- CSS tiếng Việt cho phép nhãn dài tự xuống dòng và giới hạn chiều rộng panel; tên bài và nghệ sĩ quá dài được thu gọn bằng dấu ba chấm thay vì sửa nội dung.

**Hồi quy:** `node --test tests/vi-full-lyrics-and-layout.test.js`. Bài kiểm tra xác nhận bài 235 dòng được xử lý qua 3 yêu cầu, đúng thời gian và không thay đổi metadata/lyric gốc. CI còn kiểm tra JavaScript và hồi quy của Mineradio.

**Giới hạn:** chưa xác thực mọi hộp thoại, mọi thiết bị Windows, mọi kích thước màn hình và lời dịch của mọi nguồn nhạc bằng thao tác thực tế. Không khẳng định 100% mọi thông báo runtime mới từ nhà cung cấp đều có bản dịch nếu chưa được đưa vào danh mục i18n.
