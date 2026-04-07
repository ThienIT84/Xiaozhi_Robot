import { useState } from "react";

/* ─── FONTS & COLORS ─── */
const FONT = "'Segoe UI', 'Arial', sans-serif";
const C = {
  bg: "#0f172a",
  panel: "#1e293b",
  border: "#334155",
  start: { fill: "#166534", stroke: "#4ade80", text: "#fff" },
  end:   { fill: "#7f1d1d", stroke: "#f87171", text: "#fff" },
  proc:  { fill: "#1e3a5f", stroke: "#60a5fa", text: "#e0f2fe" },
  dec:   { fill: "#713f12", stroke: "#fbbf24", text: "#fef9c3" },
  io:    { fill: "#3b0764", stroke: "#c084fc", text: "#ede9fe" },
  note:  { fill: "#134e4a", stroke: "#2dd4bf", text: "#ccfbf1" },
  arrowMain: "#60a5fa",
  arrowNo:   "#f87171",
  arrowYes:  "#4ade80",
  arrowLoop: "#94a3b8",
};

/* ─── ARROW ─── */
function Arrow({ pts, label = "", color = C.arrowMain, dashed = false, lx, ly }) {
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const [x1, y1] = pts[pts.length - 2];
  const [x2, y2] = pts[pts.length - 1];
  const a = Math.atan2(y2 - y1, x2 - x1);
  const sz = 9;
  const midX = lx ?? (x1 + x2) / 2;
  const midY = ly ?? (y1 + y2) / 2;
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={2}
        strokeDasharray={dashed ? "7,4" : undefined} />
      <polygon
        points={`${x2},${y2} ${x2 - sz * Math.cos(a - 0.38)},${y2 - sz * Math.sin(a - 0.38)} ${x2 - sz * Math.cos(a + 0.38)},${y2 - sz * Math.sin(a + 0.38)}`}
        fill={color} />
      {label && (
        <text x={midX} y={midY - 8} textAnchor="middle"
          fill="#fbbf24" fontSize={13} fontWeight="700" fontFamily={FONT}>{label}</text>
      )}
    </g>
  );
}

/* ─── OVAL (start/end) ─── */
function Oval({ x, y, w = 200, h = 44, text, sub, col }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2}
        fill={col.fill} stroke={col.stroke} strokeWidth={2.5} />
      <text x={x} y={sub ? y - 6 : y} textAnchor="middle" dominantBaseline="middle"
        fill={col.text} fontSize={14} fontWeight="700" fontFamily={FONT}>{text}</text>
      {sub && <text x={x} y={y + 10} textAnchor="middle" dominantBaseline="middle"
        fill={col.stroke} fontSize={11} fontFamily={FONT}>{sub}</text>}
    </g>
  );
}

/* ─── RECT (process) ─── */
function Box({ x, y, w = 290, h = 56, lines, col = C.proc, icon = "" }) {
  const lh = 18;
  const totalH = lines.length * lh;
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={8}
        fill={col.fill} stroke={col.stroke} strokeWidth={1.8} />
      {icon && <text x={x - w / 2 + 18} y={y} textAnchor="middle" dominantBaseline="middle"
        fontSize={20} fontFamily={FONT}>{icon}</text>}
      {lines.map((t, i) => (
        <text key={i} x={icon ? x + 8 : x}
          y={y - totalH / 2 + lh / 2 + i * lh}
          textAnchor="middle" dominantBaseline="middle"
          fill={col.text} fontSize={i === 0 ? 13 : 11.5}
          fontWeight={i === 0 ? "600" : "400"} fontFamily={FONT}>{t}</text>
      ))}
    </g>
  );
}

/* ─── DIAMOND (decision) ─── */
function Diamond({ x, y, w = 240, h = 72, lines }) {
  const pts = `${x},${y - h / 2} ${x + w / 2},${y} ${x},${y + h / 2} ${x - w / 2},${y}`;
  const lh = 17;
  return (
    <g>
      <polygon points={pts} fill={C.dec.fill} stroke={C.dec.stroke} strokeWidth={2} />
      {lines.map((t, i) => (
        <text key={i} x={x} y={y + (i - (lines.length - 1) / 2) * lh}
          textAnchor="middle" dominantBaseline="middle"
          fill={C.dec.text} fontSize={12.5} fontWeight="600" fontFamily={FONT}>{t}</text>
      ))}
    </g>
  );
}

/* ─── IO PARALLELOGRAM ─── */
function IO({ x, y, w = 290, h = 52, lines }) {
  const sk = 18;
  const pts = `${x - w / 2 + sk},${y - h / 2} ${x + w / 2 + sk},${y - h / 2} ${x + w / 2 - sk},${y + h / 2} ${x - w / 2 - sk},${y + h / 2}`;
  const lh = 17;
  return (
    <g>
      <polygon points={pts} fill={C.io.fill} stroke={C.io.stroke} strokeWidth={1.8} />
      {lines.map((t, i) => (
        <text key={i} x={x} y={y + (i - (lines.length - 1) / 2) * lh}
          textAnchor="middle" dominantBaseline="middle"
          fill={C.io.text} fontSize={i === 0 ? 13 : 11.5}
          fontWeight={i === 0 ? "600" : "400"} fontFamily={FONT}>{t}</text>
      ))}
    </g>
  );
}

/* ─── ROUNDED NOTE BOX ─── */
function Note({ x, y, w = 280, h = 44, text }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={10}
        fill={C.note.fill} stroke={C.note.stroke} strokeWidth={1.5} strokeDasharray="5,3" />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
        fill={C.note.text} fontSize={12} fontFamily={FONT}>{text}</text>
    </g>
  );
}

/* ─── DOT GRID BG ─── */
function Bg({ w, h }) {
  return (
    <>
      <defs>
        <pattern id="g" width={28} height={28} patternUnits="userSpaceOnUse">
          <circle cx={1} cy={1} r={0.9} fill="#1e293b" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill="#0b1120" />
      <rect width={w} height={h} fill="url(#g)" />
    </>
  );
}

/* ─── LEGEND ─── */
function Legend({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width={220} height={125} rx={8} fill="#0f172a" stroke="#334155" />
      <text x={x + 10} y={y + 16} fill="#64748b" fontSize={11} fontWeight="700" fontFamily={FONT}>CHÚ THÍCH KÝ HIỆU</text>
      {[
        { shape: "oval-g", col: C.start, label: "Bắt đầu / Kết thúc" },
        { shape: "rect",   col: C.proc,  label: "Bước xử lý" },
        { shape: "diam",   col: C.dec,   label: "Câu hỏi / Điều kiện" },
        { shape: "para",   col: C.io,    label: "Nhập hoặc xuất dữ liệu" },
        { shape: "dash",   col: { stroke: C.arrowLoop }, label: "Mũi tên quay lại" },
      ].map((it, i) => (
        <g key={i}>
          {it.shape === "oval-g" && <rect x={x + 10} y={y + 24 + i * 20} width={22} height={12} rx={6} fill={it.col.fill} stroke={it.col.stroke} strokeWidth={1.2} />}
          {it.shape === "rect"   && <rect x={x + 10} y={y + 24 + i * 20} width={22} height={12} rx={3} fill={it.col.fill} stroke={it.col.stroke} strokeWidth={1.2} />}
          {it.shape === "diam"   && <polygon points={`${x + 21},${y + 24 + i * 20} ${x + 32},${y + 30 + i * 20} ${x + 21},${y + 36 + i * 20} ${x + 10},${y + 30 + i * 20}`} fill={it.col.fill} stroke={it.col.stroke} strokeWidth={1} />}
          {it.shape === "para"   && <polygon points={`${x + 14},${y + 24 + i * 20} ${x + 32},${y + 24 + i * 20} ${x + 28},${y + 36 + i * 20} ${x + 10},${y + 36 + i * 20}`} fill={it.col.fill} stroke={it.col.stroke} strokeWidth={1} />}
          {it.shape === "dash"   && <line x1={x + 10} y1={y + 30 + i * 20} x2={x + 32} y2={y + 30 + i * 20} stroke={it.col.stroke} strokeWidth={1.5} strokeDasharray="5,3" />}
          <text x={x + 38} y={y + 32 + i * 20} fill="#94a3b8" fontSize={10.5} fontFamily={FONT}>{it.label}</text>
        </g>
      ))}
    </g>
  );
}

/* ══════════════════════════════════════════════════════
   CHART 1 — TỔNG QUAN
══════════════════════════════════════════════════════ */
function Chart1() {
  const cx = 380, W = 800, H = 1520;
  return (
    <svg width={W} height={H}>
      <Bg w={W} h={H} />

      {/* Title */}
      <text x={W / 2} y={24} textAnchor="middle" fill="#7dd3fc" fontSize={15} fontWeight="700" fontFamily={FONT}>
        LƯU ĐỒ TỔNG QUAN — Robot Xiaozhi hoạt động như thế nào?
      </text>
      <Legend x={568} y={42} />

      {/* 1 – Start */}
      <Oval x={cx} y={58} col={C.start} text="🟢  BẮT ĐẦU" />
      <Arrow pts={[[cx,80],[cx,104]]} />

      {/* 2 – Boot */}
      <Box x={cx} y={132} lines={["🔌  Bật nguồn robot", "ESP32-S3 khởi động, kiểm tra hệ thống"]} />
      <Arrow pts={[[cx,160],[cx,184]]} />

      {/* 3 – WiFi */}
      <Box x={cx} y={212} lines={["📶  Kết nối WiFi", "Dùng SSID + mật khẩu đã lưu sẵn"]} />
      <Arrow pts={[[cx,240],[cx,262]]} />

      {/* 4 – WiFi? */}
      <Diamond x={cx} y={298} lines={["Kết nối WiFi", "thành công chưa?"]} />
      <Arrow pts={[[cx+120,298],[550,298]]} label="Chưa" color={C.arrowNo} lx={506} ly={286} />
      <Box x={630} y={298} w={152} h={44} lines={["Thử lại hoặc vào","cấu hình WiFi"]} />
      <Arrow pts={[[630,320],[630,348],[710,348],[710,200],[cx,200],[cx,184]]} color={C.arrowNo} dashed />
      <Arrow pts={[[cx,334],[cx,362]]} label="Rồi ✓" color={C.arrowYes} lx={cx+24} ly={347} />

      {/* 5 – Cloud MQTT */}
      <Box x={cx} y={390} lines={["☁️  Kết nối máy chủ AI qua MQTT", "Thiết lập kênh giao tiếp realtime"]} />
      <Arrow pts={[[cx,418],[cx,440]]} />

      {/* 6 – Cloud? */}
      <Diamond x={cx} y={476} lines={["Máy chủ AI", "phản hồi chưa?"]} />
      <Arrow pts={[[cx+120,476],[550,476]]} label="Chưa" color={C.arrowNo} lx={506} ly={464} />
      <Box x={630} y={476} w={152} h={44} lines={["Chờ 5 giây","rồi thử lại"]} />
      <Arrow pts={[[630,498],[630,520],[710,520],[710,378],[cx,378],[cx,362]]} color={C.arrowNo} dashed />
      <Arrow pts={[[cx,512],[cx,536]]} label="Rồi ✓" color={C.arrowYes} lx={cx+24} ly={523} />

      {/* 7 – OTA Check (NEW) */}
      <Box x={cx} y={564} lines={["🔄  Kiểm tra cập nhật firmware (OTA)", "So sánh phiên bản hiện tại với server"]} />
      <Arrow pts={[[cx,592],[cx,616]]} />

      {/* 8 – MQTT Activation (NEW) */}
      <Box x={cx} y={644} lines={["🔑  Đăng nhập & kích hoạt thiết bị", "Xác thực UUID qua MQTT → sẵn sàng"]} />
      <Arrow pts={[[cx,672],[cx,696]]} />

      {/* 9 – STANDBY */}
      <Box x={cx} y={724} col={C.note} lines={["💤  Robot ở trạng thái chờ (Standby)","Luôn lắng nghe xem có ai gọi không"]} />
      <Arrow pts={[[cx,752],[cx,776]]} />

      {/* 10 – Wake word */}
      <Diamond x={cx} y={812} lines={["Nghe thấy", '"Xin chào Xiaozhi"?']} />
      <Arrow pts={[[cx+120,812],[550,812]]} label="Chưa" color={C.arrowNo} lx={502} ly={800} />
      <Box x={626} y={812} w={152} h={44} lines={["Tiếp tục","lắng nghe"]} />
      <Arrow pts={[[626,834],[626,856],[710,856],[710,710],[cx,710],[cx,696]]} color={C.arrowNo} dashed />
      <Arrow pts={[[cx,848],[cx,874]]} label="Có ✓" color={C.arrowYes} lx={cx+24} ly={860} />

      {/* 11 – Record */}
      <IO x={cx} y={902} lines={["🎤  Thu âm giọng nói của người dùng","Stream realtime qua WebSocket lên AI"]} />
      <Arrow pts={[[cx,928],[cx,952]]} />

      {/* 12 – AI process */}
      <Box x={cx} y={980} lines={["🧠  AI xử lý: hiểu nội dung câu nói","Trả lời hoặc gọi MCP Tool điều khiển"]} />
      <Arrow pts={[[cx,1008],[cx,1032]]} />

      {/* 13 – MCP command? */}
      <Diamond x={cx} y={1068} lines={["AI gọi MCP Tool", "điều khiển thiết bị?"]} />
      <Arrow pts={[[cx+120,1068],[546,1068]]} label="Có ✓" color={C.arrowYes} lx={505} ly={1056} />
      <Box x={626} y={1068} w={172} h={52} lines={["⚙️  Thực thi MCP Tool","(servo, relay, sensor...)"]} col={C.proc} />
      <Arrow pts={[[626,1094],[626,1118],[710,1118],[710,1242],[cx,1242],[cx,1232]]} color={C.arrowYes} dashed />
      <Arrow pts={[[cx,1104],[cx,1128]]} label="Không" color={C.arrowLoop} lx={cx+30} ly={1115} />

      {/* 14 – Audio output */}
      <IO x={cx} y={1156} lines={["🔊  Robot trả lời bằng giọng nói","Phát audio qua loa (TTS streaming)"]} />
      <Arrow pts={[[cx,1182],[cx,1206]]} />

      {/* 15 – Motion + expression */}
      <Box x={cx} y={1232} lines={["🤖  Robot cử động + biểu cảm trên LCD","Servo + EmoteDisplay đồng bộ với lời nói"]} />
      <Arrow pts={[[cx,1260],[cx,1280]]} />

      {/* 16 – Tiếp tục? */}
      <Diamond x={cx} y={1316} lines={["Người dùng","muốn tiếp tục?"]} />
      <Arrow pts={[[cx-120,1316],[55,1316],[55,710],[cx,710],[cx,696]]} label="Có" color={C.arrowYes} dashed lx={55} ly={1003} />
      <Arrow pts={[[cx,1352],[cx,1376]]} label="Không" color={C.arrowLoop} lx={cx+30} ly={1363} />

      {/* 17 – Back to standby (LOOP) */}
      <Box x={cx} y={1402} col={C.note} lines={["💤  Quay về chế độ chờ (Standby)","Sẵn sàng cho lần gọi tiếp theo"]} />
      <Arrow pts={[[cx,1430],[cx,1450],[40,1450],[40,710],[cx,710],[cx,696]]} color={C.arrowLoop} dashed label="Luôn lặp" lx={40} ly={1080} />

      <Note x={cx} y={1488} w={360} text="📌  Robot không bao giờ 'kết thúc' — luôn quay lại Standby" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   CHART 2 — GIỌNG NÓI (đơn giản hóa)
══════════════════════════════════════════════════════ */
function Chart2() {
  const cx = 370, W = 780, H = 1150;
  return (
    <svg width={W} height={H}>
      <Bg w={W} h={H} />
      <text x={W / 2} y={24} textAnchor="middle" fill="#7dd3fc" fontSize={15} fontWeight="700" fontFamily={FONT}>
        LƯU ĐỒ CHI TIẾT: Robot nghe và trả lời như thế nào?
      </text>
      <Legend x={548} y={42} />

      <Oval x={cx} y={58} col={C.start} text="▶  Bắt đầu — Module giọng nói" w={270} />
      <Arrow pts={[[cx,80],[cx,104]]} />

      <Box x={cx} y={132} lines={["🔧  Bật micro và loa","Chuẩn bị thu + phát âm thanh"]} />
      <Arrow pts={[[cx,160],[cx,184]]} />

      <Box x={cx} y={212} lines={["🛡️  Bật tính năng lọc nhiễu","Loại bỏ tiếng ồn xung quanh, tiếng vọng loa"]} />
      <Arrow pts={[[cx,240],[cx,264]]} />

      <Box x={cx} y={292} col={C.note} lines={["💤  Robot lắng nghe liên tục","Chờ nghe thấy câu kích hoạt..."]} />
      <Arrow pts={[[cx,318],[cx,342]]} />

      {/* Wake */}
      <Diamond x={cx} y={378} lines={['Nghe thấy "Xin chào Xiaozhi"', "hay từ kích hoạt không?"]} />
      <Arrow pts={[[cx+122,378],[542,378]]} label="Chưa" color={C.arrowNo} lx={502} ly={366} />
      <Box x={618} y={378} w={148} h={44} lines={["Tiếp tục","nghe thêm"]} />
      <Arrow pts={[[618,400],[618,424],[704,424],[704,278],[cx,278],[cx,264]]} color={C.arrowNo} dashed />
      <Arrow pts={[[cx,414],[cx,440]]} label="Có ✓" color={C.arrowYes} lx={cx+24} ly={426} />

      <Box x={cx} y={468} lines={["📢  Báo hiệu: robot đang lắng nghe","Đèn/LCD hiện 'Tôi đang nghe...'"]} />
      <Arrow pts={[[cx,496],[cx,518]]} />

      <IO x={cx} y={548} lines={["🎤  Ghi âm giọng nói người dùng","Stream realtime qua WebSocket lên AI"]} />
      <Arrow pts={[[cx,574],[cx,596]]} />

      <Diamond x={cx} y={632} lines={["Người dùng nói xong chưa?","(im lặng > 1.5 giây)"]} />
      <Arrow pts={[[cx+122,632],[542,632]]} label="Chưa" color={C.arrowNo} lx={502} ly={620} />
      <Box x={618} y={632} w={148} h={44} lines={["Tiếp tục","ghi âm"]} />
      <Arrow pts={[[618,654],[618,678],[704,678],[704,530],[cx,530],[cx,518]]} color={C.arrowNo} dashed />
      <Arrow pts={[[cx,668],[cx,694]]} label="Xong ✓" color={C.arrowYes} lx={cx+28} ly={680} />

      <Box x={cx} y={722} lines={["☁️  Máy chủ AI chuyển giọng nói → chữ","AI đọc hiểu nội dung câu nói"]} />
      <Arrow pts={[[cx,750],[cx,772]]} />

      <Diamond x={cx} y={808} lines={["AI hiểu được", "câu nói chưa?"]} />
      <Arrow pts={[[cx+116,808],[542,808]]} label="Không" color={C.arrowNo} lx={502} ly={796} />
      <IO x={cx+180} y={808} w={172} h={44} lines={["🔊  Phát: 'Tôi không nghe rõ,","xin nói lại'"]} />
      <Arrow pts={[[cx+180,830],[cx+180,860],[704,860],[704,454],[cx,454],[cx,440]]} color={C.arrowNo} dashed />
      <Arrow pts={[[cx,844],[cx,868]]} label="Có ✓" color={C.arrowYes} lx={cx+24} ly={856} />

      <Box x={cx} y={896} lines={["🧠  AI tạo câu trả lời phù hợp","(hoặc gọi MCP Tool điều khiển thiết bị)"]} />
      <Arrow pts={[[cx,924],[cx,948]]} />

      <IO x={cx} y={978} lines={["🔊  Phát câu trả lời qua loa","Robot nói chuyện với người dùng"]} />
      <Arrow pts={[[cx,1004],[cx,1022]]} />

      <Box x={cx} y={1050} col={C.note} lines={["💤  Quay lại chế độ chờ","Sẵn sàng nghe lần gọi tiếp theo"]} />
      <Arrow pts={[[cx,1076],[cx,1096]]} />

      <Oval x={cx} y={1122} col={C.end} text="■  Kết thúc lượt hội thoại" w={240} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   CHART 3 — ĐIỀU KHIỂN THIẾT BỊ (MCP Protocol)
══════════════════════════════════════════════════════ */
function Chart3() {
  const cx = 370, W = 780, H = 1060;
  return (
    <svg width={W} height={H}>
      <Bg w={W} h={H} />
      <text x={W / 2} y={24} textAnchor="middle" fill="#7dd3fc" fontSize={15} fontWeight="700" fontFamily={FONT}>
        LƯU ĐỒ CHI TIẾT: Điều khiển thiết bị qua MCP Protocol
      </text>
      <Legend x={548} y={42} />

      <Oval x={cx} y={60} col={C.start} text="▶  AI quyết định gọi MCP Tool" w={310} />
      <Arrow pts={[[cx,82],[cx,106]]} />

      <IO x={cx} y={136} lines={["📥  Nhận MCP tool_call từ server","JSON-RPC: tên tool + tham số"]} />
      <Arrow pts={[[cx,162],[cx,186]]} />

      <Box x={cx} y={214} lines={["🔍  ESP32 tra cứu tool đã đăng ký","So khớp tên tool trong MCP registry"]} />
      <Arrow pts={[[cx,242],[cx,266]]} />

      <Diamond x={cx} y={302} lines={["Tool có tồn tại","trong hệ thống?"]} />
      <Arrow pts={[[cx+118,302],[540,302]]} label="Không" color={C.arrowNo} lx={500} ly={290} />
      <IO x={cx+178} y={302} w={188} h={44} lines={["🔴  Trả lỗi về AI server","'Tool không tồn tại'"]} />
      <Arrow pts={[[cx,338],[cx,366]]} label="Có ✓" color={C.arrowYes} lx={cx+24} ly={351} />

      {/* Branch 1 – Servo */}
      <Diamond x={cx} y={402} lines={["Tool là:","self.servo.X.set_angle?"]} />
      <Arrow pts={[[cx+118,402],[540,402]]} label="Có ✓" color={C.arrowYes} lx={500} ly={390} />
      <Box x={628} y={402} w={210} h={52} lines={["🤖  Điều khiển Servo (LEDC PWM)","set_angle(0°-180°) → 4 servo"]} col={C.proc} />
      <Arrow pts={[[628,428],[628,460],[720,460],[720,850],[cx,850],[cx,840]]} color={C.arrowYes} dashed />
      <Arrow pts={[[cx,438],[cx,466]]} label="Không" color={C.arrowLoop} lx={cx+30} ly={451} />

      {/* Branch 2 – Volume */}
      <Diamond x={cx} y={502} lines={["Tool là:","self.audio.set_volume?"]} />
      <Arrow pts={[[cx+118,502],[540,502]]} label="Có ✓" color={C.arrowYes} lx={500} ly={490} />
      <Box x={628} y={502} w={210} h={52} lines={["🔊  Điều chỉnh âm lượng loa","set_volume(0-100)"]} col={C.proc} />
      <Arrow pts={[[628,528],[628,560],[720,560],[720,850],[cx,850],[cx,840]]} color={C.arrowYes} dashed />
      <Arrow pts={[[cx,538],[cx,566]]} label="Không" color={C.arrowLoop} lx={cx+30} ly={551} />

      {/* Branch 3 – Relay / Smart Home (planned) */}
      <Diamond x={cx} y={602} lines={["Tool là:","self.relay.X.set_state?"]} />
      <Arrow pts={[[cx+118,602],[540,602]]} label="Có ✓" color={C.arrowYes} lx={500} ly={590} />
      <Box x={628} y={602} w={210} h={52} lines={["💡  Bật/tắt relay (GPIO)","Đèn, quạt, ổ cắm... [kế hoạch]"]} col={C.proc} />
      <Arrow pts={[[628,628],[628,660],[720,660],[720,850],[cx,850],[cx,840]]} color={C.arrowYes} dashed />
      <Arrow pts={[[cx,638],[cx,666]]} label="Không" color={C.arrowLoop} lx={cx+30} ly={651} />

      {/* Branch 4 – Sensor (planned) */}
      <Diamond x={cx} y={702} lines={["Tool là:","self.sensor.X.get_value?"]} />
      <Arrow pts={[[cx+118,702],[540,702]]} label="Có ✓" color={C.arrowYes} lx={500} ly={690} />
      <Box x={628} y={702} w={210} h={52} lines={["📊  Đọc cảm biến (PZEM / nhiệt độ)","Trả số liệu cho AI [kế hoạch]"]} col={C.proc} />
      <Arrow pts={[[628,728],[628,760],[720,760],[720,850],[cx,850],[cx,840]]} color={C.arrowYes} dashed />
      <Arrow pts={[[cx,738],[cx,764]]} label="Không" color={C.arrowLoop} lx={cx+30} ly={750} />

      {/* Unknown tool */}
      <Note x={cx} y={796} text="⚠️  Tool không xác định — trả lỗi về AI server" w={320} />
      <Arrow pts={[[cx,818],[cx,840]]} color={C.arrowLoop} dashed />

      {/* Return result */}
      <IO x={cx} y={866} lines={["📤  Trả JSON result về AI server","AI tổng hợp → trả lời người dùng bằng giọng nói"]} />
      <Arrow pts={[[cx,892],[cx,916]]} />

      <Note x={cx} y={946} w={380} text="📌  Mỗi tool là 1 hàm ESP32 đăng ký qua McpServer::AddTool()" />
      <Arrow pts={[[cx,968],[cx,992]]} />

      <Oval x={cx} y={1018} col={C.end} text="■  Hoàn thành xử lý MCP Tool" w={280} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   CHART 4 — ĐO ĐIỆN (đơn giản hóa)
══════════════════════════════════════════════════════ */
function Chart4() {
  const cx = 370, W = 780, H = 970;
  return (
    <svg width={W} height={H}>
      <Bg w={W} h={H} />
      <text x={W / 2} y={24} textAnchor="middle" fill="#7dd3fc" fontSize={15} fontWeight="700" fontFamily={FONT}>
        LƯU ĐỒ CHI TIẾT: Đo và giám sát điện năng tiêu thụ  ⏳ KẾ HOẠCH
      </text>
      <rect x={548} y={170} width={180} height={28} rx={6} fill="#7f1d1d" stroke="#f87171" strokeWidth={1.5} />
      <text x={638} y={188} textAnchor="middle" fill="#fecaca" fontSize={11} fontWeight="700" fontFamily={FONT}>⏳ CHƯA TRIỂN KHAI — DỰ KIẾN</text>
      <Legend x={548} y={42} />

      <Oval x={cx} y={60} col={C.start} text="▶  Bắt đầu — Module đo điện" w={260} />
      <Arrow pts={[[cx,82],[cx,106]]} />

      <Box x={cx} y={134} lines={["🔧  Khởi động cảm biến đo điện (PZEM-004T)","Chuẩn bị cổng giao tiếp với ESP32"]} />
      <Arrow pts={[[cx,162],[cx,184]]} />

      <Box x={cx} y={212} col={C.note} lines={["⏱️  Đặt lịch: cứ 1 giây đo điện 1 lần","Robot tự động lặp lại liên tục"]} />
      <Arrow pts={[[cx,240],[cx,264]]} />

      <Box x={cx} y={292} lines={["📡  Gửi yêu cầu đọc số liệu","Hỏi cảm biến: 'Cho tôi biết thông số điện'"]} />
      <Arrow pts={[[cx,320],[cx,342]]} />

      <Diamond x={cx} y={378} lines={["Cảm biến trả lời","trong 0.5 giây không?"]} />
      <Arrow pts={[[cx+118,378],[540,378]]} label="Không" color={C.arrowNo} lx={499} ly={366} />
      <Box x={616} y={378} w={176} h={52} lines={["⚠️  Đếm lỗi +1","Nếu 5 lần lỗi: hiện cảnh báo"]} />
      <Arrow pts={[[616,404],[616,428],[704,428],[704,278],[cx,278],[cx,264]]} color={C.arrowNo} dashed />
      <Arrow pts={[[cx,414],[cx,438]]} label="Có ✓" color={C.arrowYes} lx={cx+24} ly={425} />

      <Diamond x={cx} y={474} lines={["Dữ liệu nhận về", "có chính xác không?"]} />
      <Arrow pts={[[cx+116,474],[538,474]]} label="Không" color={C.arrowNo} lx={498} ly={462} />
      <Box x={614} y={474} w={176} h={44} lines={["Bỏ qua lần này","chờ lần đo tiếp"]} />
      <Arrow pts={[[614,496],[614,520],[704,520],[704,278],[cx,278],[cx,264]]} color={C.arrowNo} dashed />
      <Arrow pts={[[cx,510],[cx,534]]} label="Có ✓" color={C.arrowYes} lx={cx+24} ly={521} />

      <Box x={cx} y={562} lines={["📊  Tính toán các chỉ số điện:","Điện áp (V)  •  Dòng (A)  •  Công suất (W)  •  Điện năng (kWh)"]} />
      <Arrow pts={[[cx,590],[cx,614]]} />

      <IO x={cx} y={644} lines={["🖥️  Hiển thị số liệu lên màn hình LCD","V = ?  |  A = ?  |  W = ?  |  kWh = ?"]} />
      <Arrow pts={[[cx,670],[cx,694]]} />

      <Diamond x={cx} y={730} lines={["Có ai hỏi về số liệu","điện không?"]} />
      <Arrow pts={[[cx+116,730],[538,730]]} label="Có ✓" color={C.arrowYes} lx={497} ly={718} />
      <IO x={cx+178} y={730} w={188} h={52} lines={["🔊  AI đọc số liệu","cho người dùng nghe"]} />
      <Arrow pts={[[cx+178,756],[cx+178,780],[704,780],[704,278],[cx,278],[cx,264]]} color={C.arrowYes} dashed />
      <Arrow pts={[[cx,766],[cx,790]]} label="Không" color={C.arrowLoop} lx={cx+30} ly={777} />

      <Diamond x={cx} y={826} lines={["Điện dùng vượt mức", "an toàn (> 2000W)?"]} />
      <Arrow pts={[[cx+116,826],[538,826]]} label="Có ✓" color={C.arrowNo} lx={497} ly={814} />
      <IO x={cx+180} y={826} w={188} h={52} lines={["🚨  Phát cảnh báo","'Điện đang dùng quá nhiều!'"]} />
      <Arrow pts={[[cx+180,852],[cx+180,876],[704,876],[704,278],[cx,278],[cx,264]]} color={C.arrowNo} dashed />
      <Arrow pts={[[cx,862],[cx,884]]} label="Bình thường" color={C.arrowLoop} lx={cx+44} ly={873} />

      <Note x={cx} y={910} text="💤  Chờ 1 giây rồi đo lại — lặp liên tục" w={290} />
      <Arrow pts={[[cx,932],[cx,950],[40,950],[40,278],[cx,278],[cx,264]]} color={C.arrowLoop} dashed label="Lặp lại" lx={40} ly={614} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   CHART 5 — BIỂU CẢM EMOTE DISPLAY
══════════════════════════════════════════════════════ */
function Chart5() {
  const cx = 370, W = 780, H = 1100;
  return (
    <svg width={W} height={H}>
      <Bg w={W} h={H} />
      <text x={W / 2} y={24} textAnchor="middle" fill="#7dd3fc" fontSize={15} fontWeight="700" fontFamily={FONT}>
        LƯU ĐỒ CHI TIẾT: Hệ thống biểu cảm EmoteDisplay trên LCD
      </text>
      <Legend x={548} y={42} />

      <Oval x={cx} y={60} col={C.start} text="▶  Khởi động — Module biểu cảm" w={290} />
      <Arrow pts={[[cx,82],[cx,106]]} />

      <Box x={cx} y={134} lines={["🖥️  Khởi tạo LCD ST7789 (SPI 240×240)","Reset → invert color → bật hiển thị"]} />
      <Arrow pts={[[cx,162],[cx,186]]} />

      <Box x={cx} y={214} lines={["🎨  Khởi tạo Emote Engine (GFX 30 FPS)","Cấp buffer, tạo flush callback DMA"]} />
      <Arrow pts={[[cx,242],[cx,266]]} />

      <Box x={cx} y={294} lines={["📦  Mount assets partition vào bộ nhớ","Load index.json → emoji, icon, font, layout"]} />
      <Arrow pts={[[cx,322],[cx,346]]} />

      <Diamond x={cx} y={382} lines={["Load assets","thành công?"]} />
      <Arrow pts={[[cx+118,382],[540,382]]} label="Không" color={C.arrowNo} lx={500} ly={370} />
      <Box x={618} y={382} w={168} h={44} lines={["⚠️  Log lỗi","Chạy mặc định (không icon)"]} />
      <Arrow pts={[[cx,418],[cx,444]]} label="Có ✓" color={C.arrowYes} lx={cx+24} ly={430} />

      <Box x={cx} y={472} col={C.note} lines={["😊  Hiển thị mặt mặc định (neutral)","Mắt chớp tự nhiên — sẵn sàng"]} />
      <Arrow pts={[[cx,500],[cx,524]]} />

      {/* Event loop */}
      <Diamond x={cx} y={560} lines={["Nhận sự kiện","từ Application?"]} />
      <Arrow pts={[[cx+122,560],[546,560]]} label="Chưa" color={C.arrowNo} lx={504} ly={548} />
      <Box x={624} y={560} w={148} h={44} lines={["Tiếp tục render","frame hiện tại"]} />
      <Arrow pts={[[624,582],[624,606],[712,606],[712,486],[cx,486],[cx,500]]} color={C.arrowNo} dashed />
      <Arrow pts={[[cx,596],[cx,622]]} label="Có ✓" color={C.arrowYes} lx={cx+24} ly={608} />

      {/* Branch: Emotion */}
      <Diamond x={cx} y={658} lines={["Sự kiện:","SetEmotion?"]} />
      <Arrow pts={[[cx+118,658],[540,658]]} label="Có ✓" color={C.arrowYes} lx={500} ly={646} />
      <Box x={628} y={658} w={200} h={52} lines={["🎭  Load animation (.eaf)","happy, sad, angry, confused..."]} col={C.proc} />
      <Arrow pts={[[628,684],[628,716],[720,716],[720,934],[cx,934],[cx,924]]} color={C.arrowYes} dashed />
      <Arrow pts={[[cx,694],[cx,720]]} label="Không" color={C.arrowLoop} lx={cx+30} ly={706} />

      {/* Branch: Notification */}
      <Diamond x={cx} y={756} lines={["Sự kiện:","ShowNotification?"]} />
      <Arrow pts={[[cx+118,756],[540,756]]} label="Có ✓" color={C.arrowYes} lx={500} ly={744} />
      <Box x={628} y={756} w={200} h={52} lines={["💬  Hiện thông báo trên màn hình","WiFi status, version, chat text"]} col={C.proc} />
      <Arrow pts={[[628,782],[628,814],[720,814],[720,934],[cx,934],[cx,924]]} color={C.arrowYes} dashed />
      <Arrow pts={[[cx,792],[cx,818]]} label="Không" color={C.arrowLoop} lx={cx+30} ly={804} />

      {/* Branch: Status */}
      <Diamond x={cx} y={854} lines={["Sự kiện:","SetStatus (nghe/nói)?"]} />
      <Arrow pts={[[cx+118,854],[540,854]]} label="Có ✓" color={C.arrowYes} lx={500} ly={842} />
      <Box x={628} y={854} w={200} h={52} lines={["👂🗣️  Chuyển animation tương ứng","listen → nghe, speak → nói"]} col={C.proc} />
      <Arrow pts={[[628,880],[628,912],[720,912],[720,934],[cx,934],[cx,924]]} color={C.arrowYes} dashed />
      <Arrow pts={[[cx,890],[cx,910]]} color={C.arrowLoop} />

      {/* Render */}
      <IO x={cx} y={940} lines={["🖼️  Render frame → flush qua SPI DMA","LCD cập nhật liên tục tại 30 FPS"]} />
      <Arrow pts={[[cx,966],[cx,986],[40,986],[40,486],[cx,486],[cx,500]]} color={C.arrowLoop} dashed label="Lặp liên tục" lx={40} ly={736} />

      <Note x={cx} y={1040} w={400} text="📌  EmoteDisplay luôn chạy — chỉ thay đổi animation + text overlay" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════ */
const TABS = [
  { id: 0, emoji: "🗺️", label: "Tổng quan",   sub: "Robot làm gì?",       chart: <Chart1 /> },
  { id: 1, emoji: "🎤", label: "Giọng nói",    sub: "Nghe & trả lời",      chart: <Chart2 /> },
  { id: 2, emoji: "💡", label: "Điều khiển",   sub: "MCP Protocol",        chart: <Chart3 /> },
  { id: 3, emoji: "😊", label: "Biểu cảm",     sub: "EmoteDisplay LCD",    chart: <Chart5 /> },
  { id: 4, emoji: "⚡", label: "Đo điện",       sub: "Kế hoạch tương lai",  chart: <Chart4 /> },
];

export default function App() {
  const [active, setActive] = useState(0);

  return (
    <div style={{ background: "#0b1120", minHeight: "100vh", fontFamily: FONT, display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "18px 28px" }}>
        <div style={{ fontSize: 12, color: "#475569", letterSpacing: "2px", marginBottom: 4 }}>
          TIỂU LUẬN — CNTT
        </div>
        <div style={{ fontSize: 18, fontWeight: "800", color: "#7dd3fc" }}>
          🤖 Robot Xiaozhi × Smart Home IoT
        </div>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
          Lưu đồ giải thuật — phiên bản dễ hiểu cho thuyết trình
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, padding: "16px 28px 0", background: "#0f172a", borderBottom: "1px solid #1e293b", flexWrap: "wrap" }}>
        {TABS.map(t => {
          const on = active === t.id;
          return (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 20px",
              borderRadius: "10px 10px 0 0",
              border: on ? "1px solid #3b82f6" : "1px solid #1e293b",
              borderBottom: on ? "1px solid #0b1120" : "1px solid #1e293b",
              background: on ? "#1e293b" : "transparent",
              color: on ? "#e2e8f0" : "#4b5563",
              cursor: "pointer",
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 20 }}>{t.emoji}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: on ? "700" : "400" }}>{t.label}</div>
                <div style={{ fontSize: 11, color: on ? "#64748b" : "#374151" }}>{t.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", justifyContent: "center" }}>
        <div style={{ border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden", boxShadow: "0 0 60px rgba(59,130,246,0.07)" }}>
          {TABS[active].chart}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1e293b", padding: "10px 28px", display: "flex", gap: 28, flexWrap: "wrap" }}>
        {[
          ["🔵→", "Luồng xử lý chính"],
          ["🟢→", "Nhánh 'Có / Thành công'"],
          ["🔴→", "Nhánh 'Không / Lỗi'"],
          ["--→", "Mũi tên quay lại (vòng lặp)"],
        ].map(([sym, desc]) => (
          <span key={sym} style={{ fontSize: 12, color: "#475569" }}>{sym} {desc}</span>
        ))}
      </div>
    </div>
  );
}
