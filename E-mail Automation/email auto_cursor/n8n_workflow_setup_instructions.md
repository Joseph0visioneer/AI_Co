# n8n 워크플로우 설정 가이드

## 생성된 워크플로우 파일들

1. **`n8n_main_email_workflow.json`** - 메인 이메일 자동화 워크플로우
2. **`n8n_logging_subworkflow.json`** - 로깅 및 결과 관리 서브워크플로우

## 워크플로우 구조 상세

### 메인 워크플로우 (n8n_main_email_workflow.json)

#### 노드 구성
1. **Manual Trigger** - 수동 실행 트리거
2. **Google Sheets - 참석자 데이터 읽기** - 스프레드시트에서 참석자 정보 읽기
3. **데이터 검증 및 템플릿 선택** - 이메일 검증 및 템플릿 선택 로직
4. **Microsoft Outlook - 이메일 발송** - 실제 이메일 발송
5. **발송 결과 로깅** - 성공한 발송 결과 로깅
6. **Webhook - 로그 전송** - 로깅 서브워크플로우로 데이터 전송
7. **오류 처리 분기** - 발송 실패 시 분기 처리
8. **오류 로깅** - 실패한 발송 결과 로깅

#### 주요 기능
- 이메일 형식 검증
- 초록등급별 템플릿 자동 선택 (A: 프리미엄, B: 표준, C: 기본)
- 개인화된 이메일 제목 및 본문 생성
- 오류 처리 및 로깅
- 결과 추적

### 로깅 서브워크플로우 (n8n_logging_subworkflow.json)

#### 노드 구성
1. **Webhook - 로그 수신** - 메인 워크플로우로부터 로그 데이터 수신
2. **로그 데이터 파싱** - 수신된 데이터 검증 및 구조화
3. **Google Sheets - 로그 저장** - 로그를 스프레드시트에 저장
4. **JSON 파일 저장** - 백업용 JSON 파일 저장
5. **대시보드 요약 생성** - 통계 및 요약 정보 생성
6. **대시보드 업데이트** - 대시보드용 스프레드시트 업데이트
7. **오류 임계치 확인** - 실패율 임계치 확인
8. **관리자 알림 발송** - 임계치 초과 시 관리자에게 알림

#### 주요 기능
- 실시간 로그 수집
- 통계 생성 (성공률, 템플릿별/국가별/등급별 분석)
- 대시보드 데이터 자동 업데이트
- 오류 모니터링 및 알림

## 설정 전 준비사항

### 1. Google Sheets 설정
```bash
# 필요한 스프레드시트 탭:
1. Sheet1 (참석자 데이터)
   - 컬럼: 이름, 이메일, 국가, 초록등급, 소속, 발표시간, Travel_Grant

2. Email_Logs (발송 로그)
   - 자동 생성됨

3. Dashboard_Summary (대시보드 요약)
   - 자동 생성됨
```

### 2. Microsoft Graph API 설정
- Application (client) ID
- Directory (tenant) ID
- Client secret
- 필요 권한: Mail.Send, Mail.ReadWrite

### 3. n8n에서 워크플로우 가져오기 절차

#### Step 1: 메인 워크플로우 가져오기
1. n8n 대시보드에서 "Import from File" 선택
2. `n8n_main_email_workflow.json` 파일 업로드
3. 다음 credential 정보 설정:
   - Google Sheets OAuth2 API
   - Microsoft Outlook OAuth2 API

#### Step 2: 로깅 서브워크플로우 가져오기
1. 새 워크플로우로 `n8n_logging_subworkflow.json` 가져오기
2. Google Sheets credential 재설정
3. Microsoft Outlook credential 재설정

#### Step 3: Credential 연결
```json
{
  "googleSheetsOAuth2Api": {
    "name": "Google Sheets Account",
    "clientId": "YOUR_GOOGLE_CLIENT_ID",
    "clientSecret": "YOUR_GOOGLE_CLIENT_SECRET"
  },
  "microsoftOutlookOAuth2Api": {
    "name": "Microsoft Outlook Account", 
    "clientId": "YOUR_AZURE_CLIENT_ID",
    "clientSecret": "YOUR_AZURE_CLIENT_SECRET",
    "tenantId": "YOUR_AZURE_TENANT_ID"
  }
}
```

#### Step 4: 스프레드시트 URL 설정
- Google Sheets 노드에서 스프레드시트 URL 입력
- 각 워크플로우에서 동일한 스프레드시트 사용

#### Step 5: Webhook URL 연결
1. 로깅 서브워크플로우 활성화
2. Webhook URL 복사
3. 메인 워크플로우의 "Webhook - 로그 전송" 노드에 URL 설정

## 테스트 실행 단계

### 1. 테스트 데이터 준비
```
Google Sheets에 테스트 데이터 입력:
| 이름 | 이메일 | 국가 | 초록등급 | 소속 | 발표시간 | Travel_Grant |
|------|--------|------|----------|------|----------|--------------|
| 김철수 | kim@test.com | 한국 | A | 서울대병원 | 2025-10-15 09:00 | $1000 |
| 田中太郎 | tanaka@test.com | 일본 | B | 도쿄대병원 | 2025-10-15 10:30 | $800 |
```

### 2. 단계별 테스트
1. **로깅 서브워크플로우 활성화**
2. **메인 워크플로우 수동 실행**
3. **발송 결과 확인**
4. **로그 데이터 확인**
5. **대시보드 업데이트 확인**

### 3. 예상 결과
- 테스트 이메일 2건 발송
- Email_Logs 탭에 발송 기록 저장
- Dashboard_Summary 탭에 요약 통계 생성

## 커스터마이징 포인트

### 템플릿 수정
```javascript
// 데이터 검증 및 템플릿 선택 노드에서 수정 가능
if (row.초록등급 === 'A') {
  emailSubject = `커스텀 제목`;
  emailBody = `커스텀 본문 내용`;
}
```

### 추가 검증 로직
```javascript
// 이메일 검증 외 추가 검증 규칙
if (row.country === '특정국가' && !row.비자정보) {
  // 특별 처리 로직
}
```

### 알림 임계치 조정
```javascript
// 오류 임계치 확인 노드에서 조정
"rightValue": 5  // 실패 건수 임계치
```

## 문제 해결

### 자주 발생하는 문제들
1. **Google Sheets 권한 오류**
   - OAuth2 재인증 필요
   - 스프레드시트 공유 설정 확인

2. **Microsoft Graph API 오류**
   - 토큰 만료 시 재인증
   - API 권한 재확인

3. **Webhook 연결 실패**
   - URL 정확성 확인
   - 서브워크플로우 활성화 상태 확인

4. **이메일 발송 실패**
   - 수신자 이메일 형식 검증
   - 발송 계정 상태 확인

### 디버깅 팁
- 각 노드의 출력 데이터 확인
- Console.log를 통한 중간 결과 확인
- 테스트 모드에서 단계별 실행

---

**이제 워크플로우를 n8n에 가져와서 실행할 준비가 완료되었습니다!**
