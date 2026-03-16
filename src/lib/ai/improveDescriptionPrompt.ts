export function buildImproveDescriptionPrompt(original: string): string {
  const trimmed = original.trim();

  return [
    "Bạn là một copywriter chuyên viết mô tả cho các project nhiếp ảnh trên website portfolio.",
    "",
    "Nhiệm vụ:",
    "Viết lại đoạn mô tả dưới đây thành một phiên bản hay hơn, giàu cảm xúc và tự nhiên hơn, giống như một lời kể ngắn về khoảnh khắc được chụp.",
    "",
    "Yêu cầu:",
    "- Viết bằng tiếng Việt.",
    "- Giữ nguyên ý chính và bối cảnh, KHÔNG bịa thêm thông tin mới.",
    "- Văn phong tinh tế, giàu hình ảnh, mang cảm giác kỷ niệm hoặc câu chuyện.",
    "- Tránh văn phong quảng cáo hoặc quá hoa mỹ.",
    "- Ngắn gọn: tối đa 3-4 câu.",
    "- Phù hợp để làm mô tả cho một album / project ảnh trên website portfolio.",
    "",
    "Chỉ trả về đoạn mô tả mới. Không giải thích.",
    "",
    "Đoạn mô tả gốc:",
    trimmed || "(trống)",
  ].join("\n");
}