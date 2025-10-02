# Bedtime Stories Automation - 완전 자동화 설정 가이드

## 📋 개요

N8N BROS의 Bedtime Stories Generator를 기반으로 한 완전 자동화 워크플로우입니다. 타임스탬프별 프로세스를 모두 자동화하여 Google Sheets에서 테마만 입력하면 2-3시간 분량의 완성된 취침 동화 비디오가 자동 생성됩니다.

## 🏗️ 시스템 아키텍처

### 5단계 자동화 파이프라인

```
1. CHAPTERS → 2. GENERATE IMAGES → 3. SCRIPT WRITER → 4. AUDIO GENERATE → 5. FINAL VIDEO
```

## 🛠️ 사전 준비사항 (타임스탬프: 02:20 - 08:04)

### 1. Docker 환경 설정

```bash
# Docker Desktop 설치 후
mkdir n8n-bedtime-stories
cd n8n-bedtime-stories

# 필수 폴더 구조 생성
mkdir -p credentials shared/bedtime-stories/{images,audio,final-video,overlay,sfx}
```

### 2. Docker Compose 설정

**docker-compose.yml**
```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-bedtime-stories
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - ./n8n-data:/home/node/.n8n
      - ./shared:/home/node/shared
      - ./credentials:/home/node/credentials
    command: n8n start
```

### 3. Google Cloud 설정 (타임스탬프: 05:22 - 08:04)

```bash
# 1. Google Cloud Console에서 서비스 계정 생성
# 2. Owner 권한 부여
# 3. JSON 키 다운로드 후 credentials/service-account.json으로 저장

# 4. Container 내에서 인증 설정
docker exec -it n8n-bedtime-stories sh
gcloud auth activate-service-account --key-file=/home/node/credentials/service-account.json
gcloud config set project YOUR_PROJECT_ID

# 5. Text-to-Speech API 활성화
# Google Cloud Console에서 Cloud Text-to-Speech API 활성화
```

## 📊 Google Sheets 설정 (타임스탬프: 08:04 - 08:32)

### 필수 컬럼 구조

| theme | status | instructions | style_reference |
|-------|--------|-------------|-----------------|
| Ice Age Adventure | pending | Create a soothing story for children | Cinematic, atmospheric, soft lighting |
| Space Journey | completed | Include educational elements | Cosmic, starry, dreamy atmosphere |

## 🎨 에셋 준비 (타임스탬프: 24:41 - 25:51)

### 필수 파일들

```bash
# 오버레이 비디오 (투명 배경 MOV 파일)
shared/bedtime-stories/overlay/overlay.mov

# 배경음 (캠프파이어 사운드)
shared/bedtime-stories/sfx/sfx_0.mp3

# 오디오 리스트 파일 (자동 생성됨)
shared/bedtime-stories/audio/audios.txt
```

## 🚀 워크플로우 설정

### 1. n8n 워크플로우 임포트

```bash
# 생성된 JSON 파일을 n8n에 임포트
# n8n 웹 인터페이스 → Import → n8n-bedtime-stories-automation.json
```

### 2. 환경 변수 설정

```bash
# n8n 환경 변수
GOOGLE_PROJECT_ID=your-google-project-id
GOOGLE_APPLICATION_CREDENTIALS=/home/node/credentials/service-account.json
```

### 3. 크리덴셜 설정

- **Google Sheets API**: 서비스 계정 JSON 키
- **Google Cloud TTS**: 프로젝트 ID 및 인증 토큰

## 🎯 워크플로우 실행 프로세스

### 자동 실행 단계

1. **Schedule Trigger**: 6시간마다 자동 실행
2. **Google Sheets 체크**: 'pending' 상태 스토리 검색
3. **챕터 생성**: AI가 40개 챕터 구조 생성
4. **이미지 생성**: Pollinations.ai로 각 챕터별 이미지 생성 (7초 간격)
5. **스크립트 작성**: 2-3시간 분량 내레이션 스크립트 생성
6. **음성 합성**: Google TTS로 오디오 파일 생성
7. **비디오 편집**: FFmpeg로 최종 비디오 합성
8. **상태 업데이트**: Google Sheets 상태를 'completed'로 변경

## 🎬 FFmpeg 비디오 처리 (타임스탬프: 27:41 - 34:25)

### 1단계: 이미지 + 오버레이 합성

```bash
ffmpeg -y -framerate 1/15 -i images/story_%03d.jpg -i overlay/overlay.mov \
-filter_complex "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0015,1.3)':d=375:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080[bg];[1:v]scale=1920:1080,format=rgba[overlay];[bg][overlay]blend=all_mode=overlay:all_opacity=0.7" \
-c:v libx264 -r 30 -pix_fmt yuv420p temp_video.mp4
```

### 2단계: 오디오 + 최종 합성

```bash
ffmpeg -y -stream_loop -1 -i temp_video.mp4 -f concat -safe 0 -i audio/audios.txt -i sfx/sfx_0.mp3 \
-filter_complex "[1:a]volume=0.8[voice];[2:a]volume=0.3,aloop=loop=-1:size=2e+09[sfx];[voice][sfx]amix=inputs=2:duration=first:dropout_transition=2" \
-c:v copy -c:a aac -shortest final_video/bedtime_story_$(date +%Y%m%d_%H%M%S).mp4
```

## 🎛️ 커스터마이징 옵션

### 음성 변경 (타임스탬프: 20:44 - 21:44)

```json
{
  "voice": {
    "languageCode": "en-US",
    "name": "en-US-Journey-D",  // 다른 음성으로 변경 가능
    "ssmlGender": "MALE"
  },
  "audioConfig": {
    "speakingRate": 0.9,  // 속도 조절
    "pitch": 0           // 음높이 조절
  }
}
```

### 이미지 스타일 변경

```bash
# Pollinations.ai 모델 옵션
- flux: 고품질 이미지
- turbo: 빠른 생성
- enhance: 품질 향상
```

## 📈 성능 최적화

### 처리 시간 예상

- **3시간 비디오**: 약 1시간 렌더링 (Ryzen 5 3600 기준)
- **이미지 생성**: 40개 × 7초 = 약 5분
- **음성 합성**: 텍스트 길이에 따라 5-15분

### 리소스 요구사항

- **CPU**: 멀티코어 프로세서 권장
- **RAM**: 최소 8GB, 16GB 권장
- **저장공간**: 비디오당 약 2-5GB

## 🚨 문제 해결

### 일반적인 오류

1. **FFmpeg 오류**: Docker 컨테이너 재시작
2. **Google TTS 한도 초과**: 텍스트 분할 크기 조정
3. **이미지 생성 실패**: Pollinations.ai 서버 상태 확인

### 디버깅 팁

```bash
# 로그 확인
docker logs n8n-bedtime-stories

# 컨테이너 내부 접근
docker exec -it n8n-bedtime-stories sh

# 파일 권한 확인
ls -la /home/node/shared/bedtime-stories/
```

## 💰 비용 분석

### 무료 리소스
- **Pollinations.ai**: 완전 무료
- **n8n**: 오픈소스 무료
- **Docker**: 무료

### 유료 리소스
- **Google Cloud TTS**: $300 무료 크레딧으로 수백 시간 가능
- **서버 호스팅**: 필요시 클라우드 인스턴스

## 🎯 사용법 (타임스탬프: 30:19 - 34:56)

### 1. Google Sheets에 새 스토리 추가

```
theme: "Medieval Castle Adventure"
status: "pending"
instructions: "Include brave knights and magical elements"
style_reference: "Fantasy art, medieval, warm lighting"
```

### 2. 자동 실행 대기

- 워크플로우가 6시간마다 자동 실행
- 또는 수동으로 트리거 실행

### 3. 결과 확인

- `shared/bedtime-stories/final-video/` 폴더에서 완성된 비디오 확인
- Google Sheets에서 상태가 'completed'로 변경 확인

## 🔄 확장 가능성

### 추가 기능 구현

1. **다국어 지원**: TTS 언어 설정 변경
2. **다양한 스타일**: 이미지 프롬프트 템플릿 확장
3. **소셜 미디어 자동 업로드**: YouTube API 연동
4. **품질 개선**: 더 고급 AI 모델 사용

이 시스템은 완전 자동화된 콘텐츠 생성 파이프라인으로, 한 번 설정하면 지속적으로 고품질 취침 동화 비디오를 생성할 수 있습니다.
