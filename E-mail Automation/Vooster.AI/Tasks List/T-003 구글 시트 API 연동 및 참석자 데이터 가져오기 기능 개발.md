#### 요구사항
- Google Sheets API를 사용한 참석자 데이터 조회
- 인증된 서비스 계정으로 Sheets 읽기 권한 확보
#### 구현 상세
- Python google-api-python-client 및 OAuth2 설정
- 서비스 계정 JSON 키 파일 로드 및 스코프 설정
- pandas를 사용하여 가져온 데이터를 DataFrame으로 변환
#### 테스트 전략
- 샘플 시트 ID로 데이터 호출 테스트
- 인증 오류 및 네트워크 오류 처리 검증