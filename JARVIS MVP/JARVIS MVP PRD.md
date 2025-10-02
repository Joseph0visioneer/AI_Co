# JARVIS MVP - 상세 개발 PRD

## 1. 최소 기간 개발 전략 (4주 완성)

### 1.1 핵심 원칙
- **Week 1**: 백엔드 API + 기본 UI 구조
- **Week 2**: 미팅 분석 엔진 + 파일 업로드
- **Week 3**: 공유 시스템 + 대시보드
- **Week 4**: 개인화 기능 + 배포

### 1.2 MVP 스코프 축소
- 초기 지원 파일: 텍스트(.txt), 마크다운(.md)만
- 공유: 링크 복사 + 기본 SNS 공유만
- AI 모델: OpenAI GPT-4 API 사용 (자체 모델 개발 제외)

## 2. 기술 스택 및 아키텍처

### 2.1 프론트엔드
```javascript
// Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui 컴포넌트
- React Hook Form + Zod
- Zustand (상태관리)
- React Query (서버 상태)
```

### 2.2 백엔드
```javascript
// Tech Stack
- Next.js API Routes (풀스택)
- Prisma ORM
- PostgreSQL (Supabase)
- NextAuth.js (인증)
- OpenAI API
- Uploadthing (파일 업로드)
```

### 2.3 배포 및 인프라
```bash
# 배포 스택
- Vercel (프론트엔드 + API)
- Supabase (데이터베이스 + 스토리지)
- Upstash Redis (캐시)
```

## 3. 데이터베이스 스키마

### 3.1 Core Tables
```sql
-- 사용자
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 프로젝트/폴더
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 미팅 분석
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  original_content TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  file_url TEXT,
  file_type VARCHAR(10),
  share_token VARCHAR(50) UNIQUE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 키워드 추출
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  keyword VARCHAR(100) NOT NULL,
  frequency INTEGER DEFAULT 1,
  last_mentioned TIMESTAMP DEFAULT NOW(),
  category VARCHAR(50)
);

-- 미팅-키워드 연결
CREATE TABLE meeting_keywords (
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
  relevance_score FLOAT DEFAULT 1.0,
  PRIMARY KEY (meeting_id, keyword_id)
);
```

## 4. API 엔드포인트 설계

### 4.1 인증 API
```typescript
// /api/auth/* (NextAuth.js)
GET  /api/auth/signin
GET  /api/auth/callback/google
POST /api/auth/signout
GET  /api/auth/session
```

### 4.2 미팅 분석 API
```typescript
// /api/meetings
POST /api/meetings/upload
// Body: FormData { file: File, projectId?: string, title: string }
// Response: { meetingId: string, analysisStatus: 'processing' }

GET /api/meetings/[id]
// Response: Meeting object with analysis

POST /api/meetings/[id]/share
// Body: { shareType: 'public' | 'private' }
// Response: { shareUrl: string, shareToken: string }

DELETE /api/meetings/[id]
```

### 4.3 프로젝트 API
```typescript
// /api/projects
GET /api/projects
// Response: Project[]

POST /api/projects
// Body: { name: string, description?: string, color?: string }

PUT /api/projects/[id]
DELETE /api/projects/[id]
```

### 4.4 대시보드 API
```typescript
// /api/dashboard
GET /api/dashboard/stats
// Response: {
//   totalMeetings: number,
//   totalProjects: number,
//   thisMonthMeetings: number
// }

GET /api/dashboard/keywords
// Response: {
//   keywords: Array<{keyword: string, frequency: number, category: string}>,
//   connections: Array<{source: string, target: string, strength: number}>
// }

GET /api/dashboard/insights
// Response: { insights: string[], recommendations: string[] }
```

## 5. 컴포넌트 구조

### 5.1 페이지 구조
```
app/
├── (auth)/
│   ├── signin/page.tsx
│   └── signup/page.tsx
├── (dashboard)/
│   ├── dashboard/page.tsx
│   ├── meetings/
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── new/page.tsx
│   ├── projects/page.tsx
│   └── insights/page.tsx
├── share/[token]/page.tsx
└── api/
```

### 5.2 핵심 컴포넌트
```typescript
// components/meeting/
- MeetingUpload.tsx         // 파일 업로드 + 분석 트리거
- MeetingAnalysisView.tsx   // 분석 결과 표시
- MeetingShareModal.tsx     // 공유 모달
- MeetingList.tsx          // 미팅 목록

// components/dashboard/
- StatsCards.tsx           // 통계 카드들
- KeywordMap.tsx          // 키워드 연결 시각화
- InsightPanel.tsx        // AI 인사이트 패널
- RecentActivity.tsx      // 최근 활동

// components/ui/ (shadcn/ui)
- Button, Input, Card, Modal, Toast 등
```

## 6. AI 분석 로직

### 6.1 미팅 분석 프롬프트
```typescript
const MEETING_ANALYSIS_PROMPT = `
다음 미팅 내용을 분석하여 JSON 형태로 결과를 제공해주세요:

미팅 내용:
{content}

분석 결과 JSON 형태:
{
  "summary": "3-4줄 요약",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "actionItems": [
    {
      "task": "해야 할 일",
      "assignee": "담당자 (있을 경우)",
      "deadline": "마감일 (있을 경우)"
    }
  ],
  "participants": ["참석자1", "참석자2"],
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "sentiment": "positive|neutral|negative",
  "nextSteps": "다음 단계 제안",
  "shareableText": "SNS 공유용 간단 텍스트 (50자 내외)"
}
`;
```

### 6.2 키워드 분석 및 연결
```typescript
// 키워드 카테고리 분류
const categorizeKeywords = async (keywords: string[]): Promise<KeywordCategory[]> => {
  const prompt = `
  다음 키워드들을 카테고리로 분류해주세요:
  키워드: ${keywords.join(', ')}

  카테고리: Technology, Business, Personal, Project, Team, Strategy 중 선택

  JSON 형태로 응답: [{"keyword": "키워드", "category": "카테고리"}]
  `;
};

// 키워드 연결 강도 계산
const calculateKeywordConnections = (meetings: Meeting[]): Connection[] => {
  // 동일 미팅에 등장한 키워드들 간의 연결 강도 계산
  // 공동 등장 빈도 기반으로 0-1 사이 점수 부여
};
```

## 7. UI/UX 상세 설계

### 7.1 메인 대시보드 레이아웃
```tsx
// components/dashboard/DashboardLayout.tsx
export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">JARVIS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">새 미팅 분석</Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 영역 */}
          <div className="lg:col-span-2 space-y-6">
            <StatsCards />
            <RecentMeetings />
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            <KeywordCloud />
            <InsightPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 7.2 미팅 분석 결과 UI
```tsx
// components/meeting/MeetingAnalysisView.tsx
interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  participants: string[];
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  nextSteps: string;
  shareableText: string;
}

export default function MeetingAnalysisView({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 헤더 with 공유 버튼 */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">미팅 분석 결과</h1>
          <div className="flex items-center mt-2 space-x-2">
            <SentimentBadge sentiment={analysis.sentiment} />
            <span className="text-sm text-gray-500">
              {analysis.participants.length}명 참석
            </span>
          </div>
        </div>
        <ShareButton analysis={analysis} />
      </div>

      {/* 요약 카드 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">📋 미팅 요약</h2>
        <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
      </Card>

      {/* 핵심 포인트 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">💡 핵심 포인트</h2>
        <ul className="space-y-3">
          {analysis.keyPoints.map((point, index) => (
            <li key={index} className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <span className="text-gray-700">{point}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* 액션 아이템 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">✅ 액션 아이템</h2>
        <div className="space-y-4">
          {analysis.actionItems.map((item, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium text-gray-900">{item.task}</p>
              {item.assignee && (
                <p className="text-sm text-gray-600">담당: {item.assignee}</p>
              )}
              {item.deadline && (
                <p className="text-sm text-gray-600">마감: {item.deadline}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 키워드 태그 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">🏷️ 키워드</h2>
        <div className="flex flex-wrap gap-2">
          {analysis.keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
            >
              {keyword}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
```

## 8. 공유 시스템 구현

### 8.1 공유 컴포넌트
```tsx
// components/meeting/ShareButton.tsx
export default function ShareButton({ analysis }: { analysis: AnalysisResult }) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const generateShareUrl = async () => {
    const response = await fetch(`/api/meetings/${meetingId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shareType: 'public' })
    });
    const { shareUrl } = await response.json();
    setShareUrl(shareUrl);
  };

  const shareToSNS = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const text = `${analysis.shareableText}\n\n미팅 분석 결과 보기: ${shareUrl}`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    };
    window.open(urls[platform], '_blank');
  };

  const copyToClipboard = () => {
    const text = `${analysis.shareableText}\n\n${shareUrl}`;
    navigator.clipboard.writeText(text);
    toast.success('클립보드에 복사되었습니다!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={generateShareUrl}>
          <Share2 className="w-4 h-4 mr-2" />
          공유하기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>미팅 분석 결과 공유</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">공유 미리보기:</p>
            <p className="font-medium">{analysis.shareableText}</p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => shareToSNS('twitter')}
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter에 공유
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => shareToSNS('linkedin')}
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn에 공유
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={copyToClipboard}
            >
              <Copy className="w-4 h-4 mr-2" />
              링크 복사
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 9. 개발 단계별 체크리스트

### Week 1: 기반 구조
- [ ] Next.js 프로젝트 설정 + TypeScript
- [ ] Tailwind CSS + Shadcn/ui 설정
- [ ] Supabase 데이터베이스 설정
- [ ] Prisma 스키마 정의 및 마이그레이션
- [ ] NextAuth.js Google 로그인 구현
- [ ] 기본 라우팅 및 레이아웃 컴포넌트
- [ ] 환경변수 설정 (.env.local)

### Week 2: 미팅 분석 핵심 기능
- [ ] 파일 업로드 API (Uploadthing 연동)
- [ ] OpenAI API 연동 및 분석 로직
- [ ] 미팅 분석 결과 저장 로직
- [ ] 미팅 업로드 UI 컴포넌트
- [ ] 분석 결과 표시 UI
- [ ] 로딩 및 에러 상태 처리

### Week 3: 공유 및 대시보드
- [ ] 공유 토큰 생성 및 공개 페이지
- [ ] SNS 공유 기능 구현
- [ ] 대시보드 통계 API
- [ ] 키워드 추출 및 분석 로직
- [ ] 대시보드 UI 컴포넌트
- [ ] 프로젝트 관리 기능

### Week 4: 개인화 및 배포
- [ ] 키워드 연결 시각화 (간단한 그래프)
- [ ] AI 인사이트 생성 로직
- [ ] 개인 맞춤 추천 시스템
- [ ] Vercel 배포 설정
- [ ] 도메인 연결 및 SSL
- [ ] 성능 최적화 및 버그 수정

## 10. 환경 변수 설정

```bash
# .env.local
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI
OPENAI_API_KEY="sk-..."

# File Upload
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"

# Redis (for caching)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

이 PRD를 기반으로 4주 내에 MVP를 완성할 수 있으며, 각 주차별로 명확한 목표와 체크리스트가 있어 바이브 코딩으로 진행하기에 최적화되어 있습니다.