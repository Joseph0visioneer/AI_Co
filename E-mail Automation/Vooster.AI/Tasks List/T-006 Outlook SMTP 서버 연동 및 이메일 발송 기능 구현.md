#### 요구사항
- Outlook SMTP를 통한 이메일 전송 기능
- 전송 실패 및 예외 처리 로직
#### 구현 상세
- Python smtplib 및 email.message.EmailMessage 사용
- Flask 서비스 레이어에 send_email 함수 구현
- 재시도 로직 및 로깅 추가
#### 테스트 전략
- 실제 SMTP 서버 연결 테스트
- 발송 성공 및 실패 시나리오 유닛 테스트