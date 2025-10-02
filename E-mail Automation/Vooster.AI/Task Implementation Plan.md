
홈
태스크 관리
인사이트
Context
설계 · 문서화
AI-Custom
Rules
AI 세부 조정
설정
무료 버전 적용중
잔액
65/100
프리미엄 시작
사용 가이드
고객센터
커뮤니티

Toggle Sidebar
Vooster AIVooster AI

joseph_jang's projects
컨퍼런스 이메일 자동화

프로필
현재 프로젝트

컨퍼런스 이메일 자동화
CLI 사용법

cursor
Cursor
아직 태스크가 없습니다
프로젝트를 시작하기 위해 첫 번째 태스크를 생성해보세요.
AI가 PRD/TRD를 분석하여 적절한 태스크들을 제안해드립니다.

태스크 생성하기
더 잘 설계하기
설계 · 문서화
기획서, 설계서를 검토하세요

Rules
지침을 설정해 AI 에이전트를 더 똑똑하게 만드세요

인사이트
프로젝트 진행에 대한 각종 통계정보를 확인하세요

추가 자료
사용 가이드
Vooster로 탄탄한 프로젝트를 만드는 방법을 배워보세요

커뮤니티
바이브코딩 질문답변, 경험공유를 나누세요

태스크 생성
무료 버전 적용중


logo
태스크 계획 완료
AI PM이 제안한 태스크 계획을 확인하고 생성하세요.

Task Implementation Plan
Goal
빠른 MVP 구현: 구글 시트에서 참석자 데이터를 가져오고, 참석자 조건에 맞는 이메일 스크립트를 선택 및 발송하는 핵심 기능 구현

Task List
1. 기본 인프라 및 환경 구축
Description: React 프론트엔드, Python Flask 백엔드, MySQL 데이터베이스, Firebase Authentication 환경을 구축하고 개발 환경을 설정한다.
Importance: MUST
Expected Complexity: 5
Expected Urgency: 9

2. 사용자 인증 및 로그인 기능 구현
Description: Firebase Authentication을 활용하여 사용자 로그인 및 인증 기능을 구현한다. 이를 통해 시스템 접근 권한을 관리한다.
Importance: MUST
Expected Complexity: 4
Expected Urgency: 8

3. 구글 시트 API 연동 및 참석자 데이터 가져오기 기능 개발
Description: Google Sheets API를 활용하여 지정된 구글 시트에서 참석자 데이터를 불러오는 기능을 구현한다.
Importance: MUST
Expected Complexity: 6
Expected Urgency: 9

4. 참석자 데이터 저장 및 관리 데이터베이스 모델 설계 및 구현
Description: MySQL 데이터베이스에 참석자 정보를 저장할 수 있도록 데이터 모델을 설계하고 구현한다. 백엔드에서 데이터를 적절히 관리하도록 한다.
Importance: MUST
Expected Complexity: 5
Expected Urgency: 8

5. 참석자 조건 기반 이메일 스크립트 관리 및 선택 기능 개발
Description: 참석자 조건에 따라 알맞은 이메일 스크립트를 선택하는 로직과 관리 기능을 구현한다. 이메일 스크립트 템플릿을 관리할 수 있어야 한다.
Importance: MUST
Expected Complexity: 6
Expected Urgency: 8

6. Outlook SMTP 서버 연동 및 이메일 발송 기능 구현
Description: Python의 smtplib 등을 사용하여 Outlook SMTP 서버와 연동, 조건에 맞는 이메일을 자동으로 발송하는 기능을 개발한다.
Importance: MUST
Expected Complexity: 7
Expected Urgency: 9

7. 프론트엔드에서 참석자 데이터 확인 및 이메일 발송 UI 구현
Description: React를 사용하여 참석자 데이터를 확인하고, 이메일 발송을 제어할 수 있는 사용자 인터페이스를 구현한다.
Importance: MUST
Expected Complexity: 5
Expected Urgency: 8

Implementation Order Suggestion
기본 인프라 및 환경 구축
사용자 인증 및 로그인 기능 구현
구글 시트 API 연동 및 참석자 데이터 가져오기 기능 개발
참석자 데이터 저장 및 관리 데이터베이스 모델 설계 및 구현
참석자 조건 기반 이메일 스크립트 관리 및 선택 기능 개발
Outlook SMTP 서버 연동 및 이메일 발송 기능 구현
프론트엔드에서 참석자 데이터 확인 및 이메일 발송 UI 구현
Considerations
각 태스크는 이전 단계 완료를 전제로 하므로, 순차적 진행이 원활해야 합니다.
Google Sheets API와 Outlook SMTP 서버 연동 시 인증 및 연결 안정성을 충분히 검증해야 합니다.
Firebase Authentication 도입으로 보안과 사용자 관리가 강화되지만, 초기 설정과 권한 관리에 신경 써야 합니다.
이메일 발송 기능은 발송 실패 및 예외 상황에 대한 처리 로직도 함께 설계하는 것이 좋습니다.
UI는 사용자가 쉽게 이해하고 조작할 수 있도록 직관적으로 디자인하는 것이 중요합니다.
캡틴, 이제 이 최종 계획으로 멋진 MVP 구축을 시작할 준비가 되셨나요? 함께 힘내봐요! 🚀✨

닫기

이대로 태스크 생성