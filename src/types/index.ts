export interface Article {
  id: string; // uuid
  source_id: string; // 원본 메일 고유 ID
  source_type: string; // "newsletter"
  source_name: string; // 예: "캐릿 (careet@careet.net)"
  title: string; // 원문 제목
  original_url: string; // 원문 이동 메일 링크
  summary: string; // 3줄 요약. 반드시 개행 문자(`\n`)를 인식하여 `<br />` 등으로 렌더링할 것
  insight: string; // 마케팅 인사이트 1문장
  tags: string; // 예: "#트렌드 #마케팅" (띄어쓰기 기준으로 split 하여 개별 뱃지로 렌더링할 것)
  email_date?: string; // 실제 이메일 발송 시간
  created_at: string;
}

export interface Subscription {
  id: string; // uuid
  sender_email: string; // 중요: 이 값이 백엔드 필터링 기준이 됨
  source_name: string; // 예: "캐릿"
  created_at: string;
}
