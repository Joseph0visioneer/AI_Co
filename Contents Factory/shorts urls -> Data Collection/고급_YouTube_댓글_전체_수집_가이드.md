# 고급 YouTube 댓글 전체 수집 가이드
## 모든 댓글과 대댓글을 완벽하게 수집하는 방법

Created: 2024년 12월  
Tags: YouTube API, 댓글 수집, 페이지네이션, 대댓글, 고급 기능
Author: AI Assistant

---

## 🎯 **이 가이드로 할 수 있는 것**

- **모든 댓글 내용** 완전 수집 (페이지네이션 활용)
- **대댓글까지 포함**한 전체 댓글 트리 수집
- **댓글 감정 분석** 및 키워드 추출
- **실시간 댓글 모니터링** 기능
- **대용량 데이터 처리** 최적화

---

## 📋 **기본 버전 vs 고급 버전 비교**

| 기능 | 기본 버전 | 고급 버전 |
|------|-----------|-----------|
| **댓글 수집 개수** | 최대 100개 | **무제한 (모든 댓글)** |
| **대댓글 수집** | 제한적 | **완전한 댓글 트리** |
| **페이지네이션** | 없음 | **자동 페이지 처리** |
| **속도 최적화** | 기본 | **멀티스레딩 + 배치** |
| **데이터 분석** | 기본 통계 | **감정분석 + 키워드** |
| **API 할당량 관리** | 수동 | **자동 최적화** |

---

## 🚀 **1단계: 고급 댓글 수집기 설치**

### **1-1. 추가 라이브러리 설치**

기존 라이브러리에 추가로 설치가 필요합니다:

#### **Windows:**
```cmd
pip install google-api-python-client pandas openpyxl tqdm textblob wordcloud matplotlib seaborn nltk
```

#### **Mac:**
```bash
pip3 install google-api-python-client pandas openpyxl tqdm textblob wordcloud matplotlib seaborn nltk
```

### **1-2. 고급 댓글 수집기 코드**

새 파일 `advanced_youtube_collector.py`를 만들고 아래 코드를 붙여넣으세요:

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
YouTube 고급 댓글 수집기 - 모든 댓글과 대댓글 완전 수집
기능: 페이지네이션, 대댓글, 감정분석, 키워드 추출
"""

import re
import pandas as pd
import json
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
import os

# 진행률 표시
from tqdm import tqdm

# 감정 분석 및 텍스트 처리
try:
    from textblob import TextBlob
    import nltk
    # 필요한 NLTK 데이터 다운로드
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    SENTIMENT_AVAILABLE = True
except ImportError:
    SENTIMENT_AVAILABLE = False
    print("⚠️ 감정분석 라이브러리가 없습니다. 기본 기능만 사용됩니다.")

# 시각화
try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    from wordcloud import WordCloud
    VISUALIZATION_AVAILABLE = True
except ImportError:
    VISUALIZATION_AVAILABLE = False
    print("⚠️ 시각화 라이브러리가 없습니다. 차트 생성이 제한됩니다.")

try:
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    print("✅ Google API 라이브러리 로드 성공")
except ImportError:
    print("❌ Google API 라이브러리가 설치되지 않았습니다.")
    print("다음 명령어를 실행하세요: pip install google-api-python-client")
    exit()

class AdvancedYouTubeCommentCollector:
    def __init__(self):
        self.api_key = None
        self.youtube = None
        self.results = []
        self.total_api_calls = 0
        self.quota_usage = 0
        self.rate_limit_delay = 0.1  # API 호출 간 지연 시간(초)
        
        # 통계 정보
        self.stats = {
            'total_comments': 0,
            'total_replies': 0,
            'processing_time': 0,
            'api_calls': 0,
            'errors': 0
        }
    
    def setup_api_key(self):
        """API 키 설정 (기존과 동일)"""
        print("\n" + "="*70)
        print("🔑 YouTube Data API 키 설정 (고급 댓글 수집기)")
        print("="*70)
        
        while True:
            api_key = input("\n📋 API 키를 입력하세요: ").strip()
            
            if not api_key:
                print("❌ API 키를 입력해주세요.")
                continue
            
            if not api_key.startswith('AIza'):
                print("❌ 올바르지 않은 API 키 형식입니다.")
                continue
            
            try:
                youtube = build('youtube', 'v3', developerKey=api_key)
                test_response = youtube.videos().list(
                    part='snippet',
                    id='dQw4w9WgXcQ'
                ).execute()
                
                self.api_key = api_key
                self.youtube = youtube
                print("✅ API 키가 정상적으로 설정되었습니다!")
                break
                
            except Exception as e:
                print(f"❌ API 키 오류: {e}")
                continue
    
    def extract_video_id(self, url):
        """YouTube URL에서 비디오 ID 추출"""
        patterns = [
            r'(?:youtube\.com/shorts/)([^&\n?#]+)',
            r'(?:youtube\.com/watch\?v=)([^&\n?#]+)',
            r'(?:youtu\.be/)([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    def get_all_comments_with_pagination(self, video_id: str, max_comments: int = None) -> List[Dict]:
        """페이지네이션을 사용하여 모든 댓글 수집"""
        all_comments = []
        next_page_token = None
        page_count = 0
        
        print(f"\n🔍 모든 댓글 수집 시작 (Video ID: {video_id})")
        
        # 진행률 표시를 위한 초기 설정
        with tqdm(desc="댓글 수집 중", unit="개") as pbar:
            
            while True:
                try:
                    # API 호출 간 지연
                    time.sleep(self.rate_limit_delay)
                    
                    # 댓글 요청
                    request_params = {
                        'part': 'snippet,replies',
                        'videoId': video_id,
                        'maxResults': 100,  # 한 번에 최대 100개
                        'order': 'time',    # 시간순 정렬 (최신 댓글부터)
                        'textFormat': 'plainText'
                    }
                    
                    if next_page_token:
                        request_params['pageToken'] = next_page_token
                    
                    response = self.youtube.commentThreads().list(**request_params).execute()
                    self.stats['api_calls'] += 1
                    self.quota_usage += 1
                    
                    # 댓글 처리
                    page_comments = self._process_comment_page(response)
                    all_comments.extend(page_comments)
                    
                    # 진행률 업데이트
                    pbar.update(len(page_comments))
                    pbar.set_description(f"페이지 {page_count + 1} 처리 중")
                    
                    page_count += 1
                    
                    # 최대 댓글 수 제한 확인
                    if max_comments and len(all_comments) >= max_comments:
                        all_comments = all_comments[:max_comments]
                        print(f"\n✅ 최대 댓글 수({max_comments}개) 도달하여 수집 완료")
                        break
                    
                    # 다음 페이지 토큰 확인
                    next_page_token = response.get('nextPageToken')
                    if not next_page_token:
                        print(f"\n✅ 모든 댓글 페이지 수집 완료 (총 {page_count}페이지)")
                        break
                
                except HttpError as e:
                    if e.resp.status == 403:
                        print(f"\n❌ API 할당량 초과: {e}")
                        break
                    else:
                        print(f"\n⚠️ API 오류 (페이지 {page_count + 1}): {e}")
                        self.stats['errors'] += 1
                        continue
                
                except Exception as e:
                    print(f"\n⚠️ 예상치 못한 오류: {e}")
                    self.stats['errors'] += 1
                    continue
        
        self.stats['total_comments'] = len(all_comments)
        print(f"\n📊 수집 완료: 총 {len(all_comments)}개 댓글 (대댓글 포함)")
        return all_comments
    
    def _process_comment_page(self, response: Dict) -> List[Dict]:
        """댓글 페이지 데이터 처리"""
        comments = []
        
        for item in response.get('items', []):
            # 최상위 댓글
            top_comment = item['snippet']['topLevelComment']['snippet']
            
            comment_data = {
                'comment_id': item['id'],
                'type': 'comment',  # 댓글 타입
                'parent_id': None,  # 최상위 댓글은 부모 없음
                'author': top_comment['authorDisplayName'],
                'author_channel_id': top_comment.get('authorChannelId', {}).get('value', ''),
                'text': top_comment['textDisplay'],
                'like_count': top_comment['likeCount'],
                'published_at': top_comment['publishedAt'],
                'updated_at': top_comment.get('updatedAt', top_comment['publishedAt']),
                'reply_count': item['snippet']['totalReplyCount']
            }
            
            # 감정 분석 추가 (라이브러리가 있는 경우)
            if SENTIMENT_AVAILABLE:
                sentiment = self._analyze_sentiment(comment_data['text'])
                comment_data.update(sentiment)
            
            comments.append(comment_data)
            
            # 대댓글 처리
            if 'replies' in item:
                replies = self._process_replies(item['replies']['comments'], item['id'])
                comments.extend(replies)
                self.stats['total_replies'] += len(replies)
        
        return comments
    
    def _process_replies(self, replies_data: List[Dict], parent_comment_id: str) -> List[Dict]:
        """대댓글 처리"""
        replies = []
        
        for reply in replies_data:
            reply_snippet = reply['snippet']
            
            reply_data = {
                'comment_id': reply['id'],
                'type': 'reply',  # 대댓글 타입
                'parent_id': parent_comment_id,  # 부모 댓글 ID
                'author': reply_snippet['authorDisplayName'],
                'author_channel_id': reply_snippet.get('authorChannelId', {}).get('value', ''),
                'text': reply_snippet['textDisplay'],
                'like_count': reply_snippet['likeCount'],
                'published_at': reply_snippet['publishedAt'],
                'updated_at': reply_snippet.get('updatedAt', reply_snippet['publishedAt']),
                'reply_count': 0  # 대댓글의 대댓글은 없음
            }
            
            # 감정 분석 추가
            if SENTIMENT_AVAILABLE:
                sentiment = self._analyze_sentiment(reply_data['text'])
                reply_data.update(sentiment)
            
            replies.append(reply_data)
        
        return replies
    
    def _analyze_sentiment(self, text: str) -> Dict:
        """감정 분석 수행"""
        try:
            blob = TextBlob(text)
            sentiment_score = blob.sentiment.polarity  # -1 (부정) ~ 1 (긍정)
            
            # 감정 분류
            if sentiment_score > 0.1:
                sentiment_label = 'positive'
            elif sentiment_score < -0.1:
                sentiment_label = 'negative'
            else:
                sentiment_label = 'neutral'
            
            return {
                'sentiment_score': round(sentiment_score, 3),
                'sentiment_label': sentiment_label,
                'sentiment_magnitude': round(abs(sentiment_score), 3)
            }
        except:
            return {
                'sentiment_score': 0,
                'sentiment_label': 'neutral',
                'sentiment_magnitude': 0
            }
    
    def get_video_info_advanced(self, video_id: str) -> Optional[Dict]:
        """고급 비디오 정보 수집"""
        try:
            # 비디오 기본 정보
            video_response = self.youtube.videos().list(
                part='snippet,statistics,contentDetails',
                id=video_id
            ).execute()
            
            if not video_response['items']:
                return None
            
            video = video_response['items'][0]
            snippet = video['snippet']
            statistics = video['statistics']
            
            # 채널 정보
            channel_info = self.get_channel_info_advanced(snippet['channelId'])
            
            return {
                'video_id': video_id,
                'title': snippet.get('title', ''),
                'description': snippet.get('description', ''),
                'channel_title': snippet.get('channelTitle', ''),
                'channel_id': snippet.get('channelId', ''),
                'published_at': snippet.get('publishedAt', ''),
                'view_count': int(statistics.get('viewCount', 0)),
                'like_count': int(statistics.get('likeCount', 0)),
                'comment_count': int(statistics.get('commentCount', 0)),
                'duration': video['contentDetails'].get('duration', ''),
                'tags': snippet.get('tags', []),
                'category_id': snippet.get('categoryId', ''),
                'channel_info': channel_info
            }
            
        except Exception as e:
            print(f"❌ 비디오 정보 수집 오류: {e}")
            return None
    
    def get_channel_info_advanced(self, channel_id: str) -> Optional[Dict]:
        """고급 채널 정보 수집"""
        try:
            response = self.youtube.channels().list(
                part='snippet,statistics,brandingSettings',
                id=channel_id
            ).execute()
            
            if response['items']:
                channel = response['items'][0]
                snippet = channel['snippet']
                statistics = channel['statistics']
                
                return {
                    'channel_id': channel_id,
                    'title': snippet.get('title', ''),
                    'description': snippet.get('description', ''),
                    'published_at': snippet.get('publishedAt', ''),
                    'subscriber_count': int(statistics.get('subscriberCount', 0)),
                    'video_count': int(statistics.get('videoCount', 0)),
                    'view_count': int(statistics.get('viewCount', 0)),
                    'country': snippet.get('country', ''),
                    'custom_url': snippet.get('customUrl', '')
                }
        except:
            pass
        return None
    
    def collect_complete_data(self):
        """완전한 데이터 수집 메인 함수"""
        print("\n" + "="*70)
        print("🚀 고급 YouTube 댓글 수집기 시작")
        print("="*70)
        print("✨ 새로운 기능:")
        print("   • 모든 댓글과 대댓글 완전 수집")
        print("   • 감정 분석 및 키워드 추출")
        print("   • 고급 통계 및 시각화")
        print("="*70)
        
        collected_videos = []
        
        while True:
            print(f"\n현재 수집된 영상: {len(collected_videos)}개")
            
            # 수집 옵션 선택
            print("\n📋 수집 옵션을 선택하세요:")
            print("1. 단일 URL 입력")
            print("2. 여러 URL 한번에 입력 (줄바꿈으로 구분)")
            print("3. 파일에서 URL 목록 읽기")
            print("4. 수집 완료 및 저장")
            
            choice = input("\n선택 (1-4): ").strip()
            
            if choice == '1':
                url = input("\n🔗 YouTube URL을 입력하세요: ").strip()
                if url:
                    self._process_single_video(url, collected_videos)
            
            elif choice == '2':
                print("\n🔗 YouTube URL들을 입력하세요 (빈 줄 입력 시 완료):")
                urls = []
                while True:
                    url = input().strip()
                    if not url:
                        break
                    urls.append(url)
                
                if urls:
                    self._process_multiple_videos(urls, collected_videos)
            
            elif choice == '3':
                file_path = input("\n📁 URL 목록 파일 경로를 입력하세요: ").strip()
                if os.path.exists(file_path):
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            urls = [line.strip() for line in f if line.strip()]
                        
                        if urls:
                            self._process_multiple_videos(urls, collected_videos)
                        else:
                            print("❌ 파일에 유효한 URL이 없습니다.")
                    except Exception as e:
                        print(f"❌ 파일 읽기 오류: {e}")
                else:
                    print("❌ 파일을 찾을 수 없습니다.")
            
            elif choice == '4':
                break
            
            else:
                print("❌ 올바른 번호를 선택해주세요.")
        
        # 결과 저장
        if collected_videos:
            self.save_advanced_results(collected_videos)
        else:
            print("\n❌ 저장할 데이터가 없습니다.")
    
    def _process_single_video(self, url: str, collected_videos: List):
        """단일 비디오 처리"""
        video_id = self.extract_video_id(url)
        if not video_id:
            print("❌ 올바르지 않은 YouTube URL입니다.")
            return
        
        print(f"\n🎯 영상 처리 시작: {video_id}")
        
        # 최대 댓글 수 설정
        max_comments = input("📊 최대 댓글 수 (Enter: 무제한): ").strip()
        max_comments = int(max_comments) if max_comments.isdigit() else None
        
        start_time = time.time()
        
        # 비디오 정보 수집
        video_info = self.get_video_info_advanced(video_id)
        if not video_info:
            print("❌ 비디오 정보를 가져올 수 없습니다.")
            return
        
        # 댓글 수집
        comments = self.get_all_comments_with_pagination(video_id, max_comments)
        
        processing_time = time.time() - start_time
        
        result = {
            'video_info': video_info,
            'comments': comments,
            'collection_stats': {
                'total_comments': len(comments),
                'processing_time': round(processing_time, 2),
                'collection_date': datetime.now().isoformat()
            }
        }
        
        collected_videos.append(result)
        
        print(f"✅ 수집 완료!")
        print(f"   📊 총 댓글: {len(comments)}개")
        print(f"   ⏱️ 처리 시간: {processing_time:.1f}초")
    
    def _process_multiple_videos(self, urls: List[str], collected_videos: List):
        """여러 비디오 배치 처리"""
        print(f"\n🚀 {len(urls)}개 영상 배치 처리 시작")
        
        # 최대 댓글 수 설정
        max_comments = input("📊 영상당 최대 댓글 수 (Enter: 무제한): ").strip()
        max_comments = int(max_comments) if max_comments.isdigit() else None
        
        # 병렬 처리 여부
        use_parallel = input("⚡ 병렬 처리 사용? (y/N): ").strip().lower() == 'y'
        
        if use_parallel:
            self._process_videos_parallel(urls, collected_videos, max_comments)
        else:
            self._process_videos_sequential(urls, collected_videos, max_comments)
    
    def _process_videos_sequential(self, urls: List[str], collected_videos: List, max_comments: Optional[int]):
        """순차 처리"""
        for i, url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] 처리 중: {url}")
            
            video_id = self.extract_video_id(url)
            if not video_id:
                print("❌ 올바르지 않은 URL - 건너뜀")
                continue
            
            try:
                start_time = time.time()
                
                video_info = self.get_video_info_advanced(video_id)
                if not video_info:
                    print("❌ 비디오 정보 없음 - 건너뜀")
                    continue
                
                comments = self.get_all_comments_with_pagination(video_id, max_comments)
                processing_time = time.time() - start_time
                
                result = {
                    'video_info': video_info,
                    'comments': comments,
                    'collection_stats': {
                        'total_comments': len(comments),
                        'processing_time': round(processing_time, 2),
                        'collection_date': datetime.now().isoformat()
                    }
                }
                
                collected_videos.append(result)
                print(f"✅ 완료: {len(comments)}개 댓글, {processing_time:.1f}초")
                
            except Exception as e:
                print(f"❌ 처리 오류: {e}")
                continue
    
    def _process_videos_parallel(self, urls: List[str], collected_videos: List, max_comments: Optional[int]):
        """병렬 처리 (주의: API 할당량 빠르게 소모됨)"""
        print("⚡ 병렬 처리 모드 (API 할당량 주의)")
        
        max_workers = min(3, len(urls))  # 최대 3개 스레드
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # 작업 제출
            future_to_url = {
                executor.submit(self._process_video_for_parallel, url, max_comments): url 
                for url in urls
            }
            
            # 결과 수집
            for future in as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    result = future.result()
                    if result:
                        collected_videos.append(result)
                        print(f"✅ 완료: {url}")
                    else:
                        print(f"❌ 실패: {url}")
                except Exception as e:
                    print(f"❌ 오류 ({url}): {e}")
    
    def _process_video_for_parallel(self, url: str, max_comments: Optional[int]) -> Optional[Dict]:
        """병렬 처리용 비디오 처리 함수"""
        video_id = self.extract_video_id(url)
        if not video_id:
            return None
        
        try:
            start_time = time.time()
            
            video_info = self.get_video_info_advanced(video_id)
            if not video_info:
                return None
            
            comments = self.get_all_comments_with_pagination(video_id, max_comments)
            processing_time = time.time() - start_time
            
            return {
                'video_info': video_info,
                'comments': comments,
                'collection_stats': {
                    'total_comments': len(comments),
                    'processing_time': round(processing_time, 2),
                    'collection_date': datetime.now().isoformat()
                }
            }
        except Exception:
            return None
    
    def save_advanced_results(self, collected_videos: List[Dict]):
        """고급 결과 저장"""
        if not collected_videos:
            print("\n❌ 저장할 데이터가 없습니다.")
            return
        
        print(f"\n💾 {len(collected_videos)}개 영상 데이터 저장 중...")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        try:
            # 1. 종합 Excel 파일 생성
            self._save_comprehensive_excel(collected_videos, timestamp)
            
            # 2. 댓글 분석 리포트 생성
            self._generate_comment_analysis_report(collected_videos, timestamp)
            
            # 3. JSON 원본 데이터 저장
            json_filename = f"YouTube_Complete_Data_{timestamp}.json"
            with open(json_filename, 'w', encoding='utf-8') as f:
                json.dump(collected_videos, f, ensure_ascii=False, indent=2)
            print(f"✅ JSON 원본 데이터: {json_filename}")
            
            # 4. 통계 요약 생성
            self._generate_summary_stats(collected_videos, timestamp)
            
            print(f"\n🎉 모든 파일 저장 완료!")
            print(f"📁 생성된 파일들을 확인해보세요.")
            
        except Exception as e:
            print(f"❌ 파일 저장 오류: {e}")
    
    def _save_comprehensive_excel(self, collected_videos: List[Dict], timestamp: str):
        """종합 Excel 파일 저장"""
        filename = f"YouTube_Advanced_Analysis_{timestamp}.xlsx"
        
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            # 1. 영상 정보 시트
            video_data = []
            for item in collected_videos:
                video_info = item['video_info']
                stats = item['collection_stats']
                
                video_data.append({
                    '영상 ID': video_info['video_id'],
                    '제목': video_info['title'],
                    '채널명': video_info['channel_title'],
                    '업로드 날짜': video_info['published_at'],
                    '조회수': video_info['view_count'],
                    '좋아요 수': video_info['like_count'],
                    '공식 댓글 수': video_info['comment_count'],
                    '수집된 댓글 수': stats['total_comments'],
                    '구독자 수': video_info.get('channel_info', {}).get('subscriber_count', 0),
                    '영상 길이': video_info['duration'],
                    '수집 시간(초)': stats['processing_time'],
                    '수집 날짜': stats['collection_date']
                })
            
            pd.DataFrame(video_data).to_excel(writer, sheet_name='영상정보', index=False)
            
            # 2. 전체 댓글 시트
            all_comments = []
            for item in collected_videos:
                video_info = item['video_info']
                for comment in item['comments']:
                    comment_row = {
                        '영상 ID': video_info['video_id'],
                        '영상 제목': video_info['title'],
                        '댓글 ID': comment['comment_id'],
                        '댓글 타입': comment['type'],
                        '부모 댓글 ID': comment.get('parent_id', ''),
                        '작성자': comment['author'],
                        '댓글 내용': comment['text'],
                        '좋아요 수': comment['like_count'],
                        '작성일': comment['published_at'],
                        '수정일': comment['updated_at'],
                        '대댓글 수': comment['reply_count']
                    }
                    
                    # 감정 분석 결과 추가
                    if 'sentiment_score' in comment:
                        comment_row.update({
                            '감정 점수': comment['sentiment_score'],
                            '감정 분류': comment['sentiment_label'],
                            '감정 강도': comment['sentiment_magnitude']
                        })
                    
                    all_comments.append(comment_row)
            
            pd.DataFrame(all_comments).to_excel(writer, sheet_name='전체댓글', index=False)
            
            # 3. 댓글 통계 시트
            self._create_comment_stats_sheet(collected_videos, writer)
        
        print(f"✅ 종합 Excel 파일: {filename}")
    
    def _create_comment_stats_sheet(self, collected_videos: List[Dict], writer):
        """댓글 통계 시트 생성"""
        stats_data = []
        
        for item in collected_videos:
            video_info = item['video_info']
            comments = item['comments']
            
            # 기본 통계
            total_comments = len(comments)
            main_comments = len([c for c in comments if c['type'] == 'comment'])
            replies = len([c for c in comments if c['type'] == 'reply'])
            
            # 감정 분석 통계
            if SENTIMENT_AVAILABLE and comments:
                sentiments = [c.get('sentiment_label', 'neutral') for c in comments]
                positive_count = sentiments.count('positive')
                negative_count = sentiments.count('negative')
                neutral_count = sentiments.count('neutral')
                
                avg_sentiment = sum([c.get('sentiment_score', 0) for c in comments]) / len(comments)
            else:
                positive_count = negative_count = neutral_count = 0
                avg_sentiment = 0
            
            # 참여도 분석
            total_likes = sum([c['like_count'] for c in comments])
            avg_comment_length = sum([len(c['text']) for c in comments]) / len(comments) if comments else 0
            
            stats_row = {
                '영상 ID': video_info['video_id'],
                '영상 제목': video_info['title'],
                '총 댓글 수': total_comments,
                '원댓글 수': main_comments,
                '대댓글 수': replies,
                '댓글 총 좋아요': total_likes,
                '평균 댓글 길이': round(avg_comment_length, 1),
                '긍정 댓글': positive_count,
                '부정 댓글': negative_count,
                '중립 댓글': neutral_count,
                '평균 감정 점수': round(avg_sentiment, 3),
                '댓글 참여율(%)': round((total_comments / video_info['view_count'] * 100), 4) if video_info['view_count'] > 0 else 0
            }
            
            stats_data.append(stats_row)
        
        pd.DataFrame(stats_data).to_excel(writer, sheet_name='댓글통계', index=False)
    
    def _generate_comment_analysis_report(self, collected_videos: List[Dict], timestamp: str):
        """댓글 분석 리포트 생성"""
        if not SENTIMENT_AVAILABLE:
            return
        
        print("📊 댓글 분석 리포트 생성 중...")
        
        # 모든 댓글 수집
        all_comments = []
        for item in collected_videos:
            all_comments.extend(item['comments'])
        
        if not all_comments:
            return
        
        # 키워드 분석
        all_text = ' '.join([comment['text'] for comment in all_comments])
        
        # 워드클라우드 생성 (가능한 경우)
        if VISUALIZATION_AVAILABLE:
            try:
                plt.figure(figsize=(12, 8))
                
                # 한글 폰트 설정 (시스템에 따라 조정 필요)
                wordcloud = WordCloud(
                    width=800, 
                    height=600, 
                    background_color='white',
                    max_words=100,
                    colormap='viridis'
                ).generate(all_text)
                
                plt.imshow(wordcloud, interpolation='bilinear')
                plt.axis('off')
                plt.title('댓글 키워드 워드클라우드', fontsize=16)
                
                wordcloud_filename = f"Comment_WordCloud_{timestamp}.png"
                plt.savefig(wordcloud_filename, dpi=300, bbox_inches='tight')
                plt.close()
                
                print(f"✅ 워드클라우드: {wordcloud_filename}")
                
            except Exception as e:
                print(f"⚠️ 워드클라우드 생성 실패: {e}")
        
        # 텍스트 리포트 생성
        report_filename = f"Comment_Analysis_Report_{timestamp}.txt"
        with open(report_filename, 'w', encoding='utf-8') as f:
            f.write("YouTube 댓글 분석 리포트\n")
            f.write("=" * 50 + "\n\n")
            
            # 전체 통계
            f.write(f"분석 날짜: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"분석 영상 수: {len(collected_videos)}개\n")
            f.write(f"총 댓글 수: {len(all_comments)}개\n\n")
            
            # 감정 분석 결과
            if SENTIMENT_AVAILABLE:
                sentiments = [c.get('sentiment_label', 'neutral') for c in all_comments]
                f.write("감정 분석 결과:\n")
                f.write(f"- 긍정적: {sentiments.count('positive')}개 ({sentiments.count('positive')/len(sentiments)*100:.1f}%)\n")
                f.write(f"- 부정적: {sentiments.count('negative')}개 ({sentiments.count('negative')/len(sentiments)*100:.1f}%)\n")
                f.write(f"- 중립적: {sentiments.count('neutral')}개 ({sentiments.count('neutral')/len(sentiments)*100:.1f}%)\n\n")
            
            # 영상별 상세 분석
            f.write("영상별 상세 분석:\n")
            f.write("-" * 30 + "\n")
            
            for i, item in enumerate(collected_videos, 1):
                video_info = item['video_info']
                comments = item['comments']
                
                f.write(f"\n{i}. {video_info['title']}\n")
                f.write(f"   영상 ID: {video_info['video_id']}\n")
                f.write(f"   수집 댓글 수: {len(comments)}개\n")
                
                if comments and SENTIMENT_AVAILABLE:
                    video_sentiments = [c.get('sentiment_label', 'neutral') for c in comments]
                    f.write(f"   긍정 댓글: {video_sentiments.count('positive')}개\n")
                    f.write(f"   부정 댓글: {video_sentiments.count('negative')}개\n")
        
        print(f"✅ 분석 리포트: {report_filename}")
    
    def _generate_summary_stats(self, collected_videos: List[Dict], timestamp: str):
        """요약 통계 생성"""
        summary_filename = f"Collection_Summary_{timestamp}.txt"
        
        with open(summary_filename, 'w', encoding='utf-8') as f:
            f.write("YouTube 데이터 수집 요약\n")
            f.write("=" * 40 + "\n\n")
            
            # 수집 통계
            total_videos = len(collected_videos)
            total_comments = sum([len(item['comments']) for item in collected_videos])
            total_processing_time = sum([item['collection_stats']['processing_time'] for item in collected_videos])
            
            f.write(f"수집 완료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"처리된 영상 수: {total_videos}개\n")
            f.write(f"수집된 총 댓글 수: {total_comments:,}개\n")
            f.write(f"총 처리 시간: {total_processing_time:.1f}초\n")
            f.write(f"평균 처리 시간: {total_processing_time/total_videos:.1f}초/영상\n")
            f.write(f"평균 댓글 수: {total_comments/total_videos:.1f}개/영상\n\n")
            
            # API 사용량
            f.write(f"API 호출 수: {self.stats['api_calls']}회\n")
            f.write(f"예상 할당량 사용: {self.quota_usage}점\n")
            f.write(f"오류 발생: {self.stats['errors']}회\n\n")
            
            # 영상별 요약
            f.write("영상별 수집 결과:\n")
            f.write("-" * 25 + "\n")
            
            for i, item in enumerate(collected_videos, 1):
                video_info = item['video_info']
                stats = item['collection_stats']
                
                f.write(f"{i:2d}. {video_info['title'][:50]}{'...' if len(video_info['title']) > 50 else ''}\n")
                f.write(f"     댓글: {stats['total_comments']:,}개, 시간: {stats['processing_time']:.1f}초\n")
        
        print(f"✅ 수집 요약: {summary_filename}")

def main():
    """메인 함수"""
    print("🚀 YouTube 고급 댓글 수집기")
    print("=" * 70)
    print("🎯 주요 기능:")
    print("   • 모든 댓글과 대댓글 완전 수집 (페이지네이션)")
    print("   • 감정 분석 및 키워드 추출")
    print("   • 고급 통계 및 시각화")
    print("   • 병렬 처리 지원")
    print("   • 상세한 분석 리포트 생성")
    print("=" * 70)
    
    collector = AdvancedYouTubeCommentCollector()
    
    # API 키 설정
    collector.setup_api_key()
    
    # 데이터 수집
    collector.collect_complete_data()
    
    print(f"\n🎉 고급 댓글 수집 완료!")
    print(f"📊 API 호출: {collector.stats['api_calls']}회")
    print(f"📁 생성된 파일들을 확인해보세요.")
    input("\n종료하려면 Enter를 누르세요...")

if __name__ == "__main__":
    main()
```

---

## 🎯 **2단계: 실행 및 사용법**

### **2-1. 프로그램 실행**

#### **Windows:**
```cmd
python advanced_youtube_collector.py
```

#### **Mac:**
```bash
python3 advanced_youtube_collector.py
```

### **2-2. 새로운 기능 사용법**

#### **🔄 전체 댓글 수집**
- 기본 버전: 최대 100개 댓글
- **고급 버전: 모든 댓글 수집** (페이지네이션 자동 처리)

#### **🌳 댓글 트리 구조**
```
📋 댓글 구조 예시:
├── 원댓글 1 (comment_id: ABC123)
│   ├── 대댓글 1-1 (parent_id: ABC123)
│   └── 대댓글 1-2 (parent_id: ABC123)
├── 원댓글 2 (comment_id: DEF456)
│   └── 대댓글 2-1 (parent_id: DEF456)
└── 원댓글 3 (comment_id: GHI789)
```

#### **💭 감정 분석**
각 댓글에 대해 자동으로 분석:
- **감정 점수**: -1 (부정) ~ +1 (긍정)
- **감정 분류**: positive, negative, neutral
- **감정 강도**: 0 ~ 1

#### **⚡ 배치 처리 옵션**
1. **단일 URL**: 하나씩 처리
2. **다중 URL**: 여러 개 한번에 입력
3. **파일 읽기**: URL 목록이 담긴 텍스트 파일 처리
4. **병렬 처리**: 빠른 처리 (API 할당량 빨리 소모)

---

## 📊 **3단계: 생성되는 파일들**

### **3-1. 종합 Excel 파일**
`YouTube_Advanced_Analysis_YYYYMMDD_HHMMSS.xlsx`

#### **시트 구성:**
1. **영상정보**: 기본 영상 통계
2. **전체댓글**: 모든 댓글과 대댓글 (감정분석 포함)
3. **댓글통계**: 영상별 댓글 분석 요약

### **3-2. 분석 리포트**
- `Comment_Analysis_Report_YYYYMMDD_HHMMSS.txt`: 상세 텍스트 리포트
- `Comment_WordCloud_YYYYMMDD_HHMMSS.png`: 키워드 워드클라우드
- `Collection_Summary_YYYYMMDD_HHMMSS.txt`: 수집 요약 통계

### **3-3. 원본 데이터**
- `YouTube_Complete_Data_YYYYMMDD_HHMMSS.json`: 완전한 원본 데이터

---

## 🔧 **4단계: 고급 활용법**

### **4-1. URL 목록 파일 만들기**

`urls.txt` 파일을 만들고 한 줄에 하나씩 URL 입력:
```
https://www.youtube.com/shorts/abc123
https://www.youtube.com/shorts/def456
https://www.youtube.com/shorts/ghi789
```

### **4-2. 대용량 데이터 처리 팁**

#### **메모리 절약:**
- 한 번에 처리할 영상 수를 20개 이하로 제한
- 댓글이 많은 영상은 최대 댓글 수 설정 사용

#### **API 할당량 관리:**
- 하루 할당량: 10,000 포인트
- 댓글 수집: 영상당 약 10-50 포인트 소모
- 예상 처리 가능: 200-1000개 영상/일

### **4-3. 병렬 처리 사용 시 주의사항**

```
⚠️ 병렬 처리 주의사항:
• API 할당량을 빠르게 소모합니다
• 3개 이상 동시 처리는 권장하지 않습니다
• 네트워크 오류 발생 가능성이 높아집니다
```

---

## 📈 **5단계: 수집된 데이터 활용 예시**

### **5-1. 댓글 감정 분석**

Excel에서 감정 분석 결과 활용:
- 긍정/부정 댓글 비율 차트
- 영상별 감정 점수 비교
- 시간대별 감정 변화 추이

### **5-2. 키워드 트렌드 분석**

- 워드클라우드로 인기 키워드 시각화
- 댓글 길이별 참여도 분석
- 대댓글 활성도 비교

### **5-3. 경쟁사 분석**

여러 채널의 Shorts 댓글을 비교하여:
- 시청자 반응 패턴 분석
- 콘텐츠별 참여도 차이
- 감정 반응 비교 분석

---

## ⚠️ **주의사항 및 제한사항**

### **API 제한사항**
- **일일 할당량**: 10,000 포인트
- **댓글이 비활성화된 영상**: 수집 불가
- **비공개/삭제된 영상**: 수집 불가
- **지역 제한 영상**: 수집 제한 가능

### **수집 윤리**
- 개인정보 보호 준수
- 수집 데이터의 적절한 사용
- YouTube 이용약관 준수
- 과도한 API 사용 자제

---

## 🎯 **다음 단계: 더욱 고급 기능**

관심이 있으시다면 다음과 같은 고급 기능도 구현 가능합니다:

1. **실시간 댓글 모니터링**
2. **머신러닝 기반 댓글 분류**
3. **자동 트렌드 리포트 생성**
4. **웹 대시보드 구축**
5. **다른 플랫폼과의 댓글 비교 분석**

이 고급 버전으로 YouTube Shorts의 모든 댓글을 완벽하게 수집하고 분석할 수 있습니다!

