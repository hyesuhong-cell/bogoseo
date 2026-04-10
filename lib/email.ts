import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail({
  to,
  participantName,
  hackathonName,
  inviteLink,
}: {
  to: string;
  participantName: string;
  hackathonName: string;
  inviteLink: string;
}) {
  const { error } = await resend.emails.send({
    from: 'UD임팩트 <onboarding@resend.dev>',
    to,
    subject: `[UD임팩트] ${hackathonName} 참가 초대`,
    html: `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

    <!-- 헤더 -->
    <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 40px 40px 32px;">
      <div style="font-size: 13px; color: #93c5fd; font-weight: 600; letter-spacing: 0.05em; margin-bottom: 8px;">UD임팩트 AI 해커톤</div>
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700; line-height: 1.3;">참가 초대장이 도착했습니다</h1>
    </div>

    <!-- 본문 -->
    <div style="padding: 36px 40px;">
      <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
        안녕하세요, <strong>${participantName}</strong>님!<br>
        <strong>${hackathonName}</strong>에 초대되었습니다.<br>
        아래 버튼을 클릭하여 참가 신청을 완료하세요.
      </p>

      <!-- 해커톤 정보 -->
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px;">
        <div style="font-size: 12px; color: #0284c7; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">참가 해커톤</div>
        <div style="color: #1e293b; font-size: 17px; font-weight: 700;">${hackathonName}</div>
      </div>

      <!-- CTA 버튼 -->
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${inviteLink}"
           style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 700; font-size: 15px;">
          참가 신청하기 →
        </a>
      </div>

      <!-- 링크 직접 표시 -->
      <div style="background: #f8fafc; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">버튼이 작동하지 않으면 아래 링크를 복사하세요</div>
        <div style="font-size: 12px; color: #475569; word-break: break-all;">${inviteLink}</div>
      </div>

      <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0;">
        본 메일은 해커톤 주최측의 요청으로 발송되었습니다.<br>
        문의사항은 담당자에게 연락해주세요.
      </p>
    </div>

    <!-- 푸터 -->
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center;">
      <div style="color: #94a3b8; font-size: 12px;">© 2025 UD임팩트 · AI 역량 진단 플랫폼</div>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });

  if (error) throw new Error(error.message);
}
