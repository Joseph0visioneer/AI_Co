# YouTube 자막 다운로더 완전 가이드

> 터미널에서 유튜브 링크 하나로 자막을 쉽게 다운로드하는 완전 자동화 도구

## 📋 목차
1. [개요](#개요)
2. [빠른 시작](#빠른-시작)
3. [상세 사용법](#상세-사용법)
4. [고급 기능](#고급-기능)
5. [문제 해결](#문제-해결)
6. [활용 사례](#활용-사례)

---

## 개요

### 🎯 목적
- YouTube 영상의 자막을 터미널에서 간단하게 다운로드
- 콘텐츠 분석, 번역, 학습 목적으로 활용
- 다국어 자막 지원으로 글로벌 콘텐츠 분석 가능

### ✨ 주요 특징
- **🚀 원클릭 실행**: 터미널에서 한 줄 명령어로 실행
- **🌍 다국어 지원**: 영어, 한국어, 일본어 등 모든 언어
- **🔧 자동 설치**: 의존성 자동 설치 및 가상환경 관리
- **📁 깔끔한 출력**: SRT 형식으로 정리된 자막 파일
- **⚡ 스마트 에러 처리**: 상세한 에러 메시지와 해결 방안 제시
- **🔄 자동 업데이트**: yt-dlp 최신 버전 유지

### 📁 파일 구조
```
/Users/josephjang/Library/Mobile Documents/com~apple~CloudDocs/Obsidian/scripts/
├── youtube-subs                    # 실행 파일 (메인 스크립트)
├── youtube_subtitle_downloader.py  # Python 코어 로직
├── requirements.txt                # 의존성 패키지 목록
├── README.md                      # 상세 문서
└── subtitles/                     # 자막 파일 저장 폴더 (자동 생성)
```

---

## 빠른 시작

### 1️⃣ 터미널 열기
```bash
# macOS: Cmd + Space → "터미널" 검색
# 또는 Applications → Utilities → Terminal
```

### 2️⃣ 스크립트 폴더로 이동
```bash
cd "/Users/josephjang/Library/Mobile Documents/com~apple~CloudDocs/Obsidian/scripts"
```

### 3️⃣ 첫 실행 시 설치 (한 번만)
```bash
./youtube-subs --install
```

### 4️⃣ 기본 사용법
```bash
# 모든 언어 자막 다운로드
./youtube-subs "https://www.youtube.com/watch?v=VIDEO_ID"

# 한국어 자막만 다운로드
./youtube-subs "https://youtu.be/VIDEO_ID" --language ko
```

---

## 상세 사용법

### 🎬 기본 명령어 구조
```bash
youtube-subs <YOUTUBE_URL> [OPTIONS]
```

### 📝 주요 옵션들

| 옵션 | 설명 | 예시 |
|------|------|------|
| `-l, --language` | 자막 언어 코드 | `--language ko` |
| `-o, --output` | 출력 디렉토리 | `--output ~/Downloads` |
| `--list-languages` | 사용 가능한 언어 목록 | `--list-languages` |
| `--install` | 의존성 설치 | `--install` |
| `--update` | yt-dlp 업데이트 | `--update` |
| `-h, --help` | 도움말 표시 | `--help` |

### 🌍 언어 코드 참고표

| 언어 | 코드 | 언어 | 코드 |
|------|------|------|------|
| 영어 | `en` | 한국어 | `ko` |
| 일본어 | `ja` | 중국어 | `zh` |
| 스페인어 | `es` | 프랑스어 | `fr` |
| 독일어 | `de` | 러시아어 | `ru` |
| 모든 언어 | `auto` | - | - |

---

## 고급 기능

### 🔍 사용 가능한 언어 확인
```bash
# 특정 영상의 자막 언어 목록 확인
./youtube-subs "https://www.youtube.com/watch?v=VIDEO_ID" --list-languages
```

**출력 예시:**
```
📋 Available subtitle languages:
  Manual subtitles: en, ko, ja
  Auto-generated: en, es, fr, de
```

### 📁 커스텀 출력 디렉토리
```bash
# 홈 디렉토리의 Downloads 폴더에 저장
./youtube-subs "URL" --output ~/Downloads/subtitles

# 데스크톱에 저장
./youtube-subs "URL" --output ~/Desktop/youtube_subs

# 절대 경로로 지정
./youtube-subs "URL" --output "/Users/username/Documents/subtitles"
```

### 🔄 시스템 유지보수
```bash
# yt-dlp 최신 버전으로 업데이트
./youtube-subs --update

# 의존성 재설치 (문제 발생 시)
./youtube-subs --install
```

---

## 문제 해결

### ❌ 일반적인 오류와 해결법

#### 1. "No module named 'yt_dlp'"
**원인**: 필요한 Python 패키지가 설치되지 않음
```bash
# 해결법
./youtube-subs --install
```

#### 2. "Permission denied"
**원인**: 실행 권한이 없음
```bash
# 해결법
chmod +x youtube-subs
```

#### 3. "Invalid YouTube URL"
**원인**: 잘못된 URL 형식
```bash
# 올바른 형식 예시
./youtube-subs "https://www.youtube.com/watch?v=VIDEO_ID"
./youtube-subs "https://youtu.be/VIDEO_ID"
```

#### 4. "No subtitles available"
**원인**: 해당 영상에 자막이 없음
```bash
# 사용 가능한 언어 먼저 확인
./youtube-subs "URL" --list-languages
```

### 🔧 디버그 모드
더 자세한 로그가 필요한 경우:
```bash
# Python 스크립트 직접 실행
python3 youtube_subtitle_downloader.py "URL" --language ko
```

### 📞 지원 체크리스트
문제 발생 시 다음을 확인:
- [ ] Python 3.7+ 설치 여부
- [ ] 인터넷 연결 상태
- [ ] YouTube URL 유효성
- [ ] yt-dlp 최신 버전 여부
- [ ] 실행 권한 설정

---

## 활용 사례

### 📚 콘텐츠 분석용
```bash
# TED 강연 분석
./youtube-subs "https://www.youtube.com/watch?v=UF8uR6Z6KLc" --language en

# 한국 유튜버 콘텐츠 분석
./youtube-subs "https://youtu.be/VIDEO_ID" --language ko --output ./korean_content
```

### 🌐 다국어 학습용
```bash
# 영어 학습: 영어 자막 다운로드
./youtube-subs "https://www.youtube.com/watch?v=VIDEO_ID" --language en

# 일본어 학습: 일본어 자막 다운로드
./youtube-subs "https://youtu.be/VIDEO_ID" --language ja
```

### 🎯 마케팅 리서치용
```bash
# 경쟁사 콘텐츠 분석
./youtube-subs "https://www.youtube.com/watch?v=COMPETITOR_VIDEO" --output ./competitor_analysis

# 트렌드 분석을 위한 인기 영상 자막 수집
./youtube-subs "https://youtu.be/TRENDING_VIDEO" --language auto
```

### 📊 데이터 수집용
```bash
# 특정 채널의 여러 영상 자막 수집 (스크립트 활용)
for url in "URL1" "URL2" "URL3"; do
    ./youtube-subs "$url" --output ./channel_analysis
done
```

---

## 📁 출력 파일 형식

### 파일명 규칙
```
{비디오제목}.{언어코드}.srt
```

### 예시 출력
```
subtitles/
├── How to Learn Programming - Complete Guide.en.srt
├── 프로그래밍 배우는 법 - 완전 가이드.ko.srt
├── プログラミング学習法 - 完全ガイド.ja.srt
└── Cómo Aprender Programación - Guía Completa.es.srt
```

### SRT 파일 형식
```srt
1
00:00:00,000 --> 00:00:04,000
안녕하세요, 오늘은 프로그래밍을 배우는 방법에 대해 알아보겠습니다.

2
00:00:04,000 --> 00:00:08,000
첫 번째로, 목표를 명확히 설정하는 것이 중요합니다.
```

---

## 🚀 고급 활용 팁

### 1. PATH에 추가하여 전역 사용
```bash
# .zshrc 또는 .bashrc에 추가
echo 'export PATH="/Users/josephjang/Library/Mobile Documents/com~apple~CloudDocs/Obsidian/scripts:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 이제 어디서든 사용 가능
youtube-subs "URL"
```

### 2. 배치 처리 스크립트 작성
```bash
#!/bin/bash
# batch_download.sh

urls=(
    "https://www.youtube.com/watch?v=VIDEO1"
    "https://www.youtube.com/watch?v=VIDEO2"
    "https://www.youtube.com/watch?v=VIDEO3"
)

for url in "${urls[@]}"; do
    echo "Downloading subtitles for: $url"
    ./youtube-subs "$url" --language ko
done
```

### 3. 자동화 워크플로우 통합
```bash
# n8n이나 다른 자동화 도구와 연동
./youtube-subs "$YOUTUBE_URL" --output "$OUTPUT_DIR" --language "$LANG"
```

---

## ⚠️ 주의사항 및 법적 고지

### 저작권 준수
- 자막도 저작물이므로 **개인 사용 목적**으로만 사용
- 상업적 이용 시 저작권자의 허가 필요
- 재배포나 공개 시 법적 문제 발생 가능

### 사용 제한
- YouTube API 제한으로 대량 다운로드 시 일시적 차단 가능
- 과도한 사용은 IP 차단 위험
- 적절한 간격을 두고 사용 권장

### 기술적 제한
- 일부 영상은 자막이 제공되지 않을 수 있음
- 자동 생성 자막의 정확도는 영상 품질에 따라 달라짐
- yt-dlp 업데이트가 필요할 수 있음

---

## 📈 업데이트 로그

### v1.0.0 (2024-09-30)
- ✅ 초기 버전 출시
- ✅ 기본 자막 다운로드 기능
- ✅ 다국어 지원
- ✅ 자동 설치 기능
- ✅ 에러 처리 및 로깅
- ✅ 사용자 친화적 인터페이스

---

**Made with ❤️ for efficient YouTube subtitle downloading**

> 이 도구는 콘텐츠 분석, 학습, 연구 목적으로 개발되었습니다. 저작권을 준수하여 사용해주세요.



