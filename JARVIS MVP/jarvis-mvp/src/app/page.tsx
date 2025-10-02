export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">JARVIS</h1>
              <span className="ml-2 text-sm text-gray-500">Just A Revolutionary Virtual Intelligence System</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">로그인</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">시작하기</button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI로 미팅을 <br />
            <span className="text-blue-600">혁신</span>하세요
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            미팅 녹음을 업로드하면 JARVIS가 자동으로 분석하고 요약해드립니다.
            개인 맞춤형 인사이트와 함께 성장하는 AI 어시스턴트를 경험해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg">
              무료로 시작하기
            </button>
            <button className="px-8 py-3 border border-gray-300 rounded-md hover:bg-gray-50 text-lg">
              데모 보기
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <span className="text-2xl mr-3">🎤</span>
                미팅 분석
              </h3>
              <p className="text-gray-600 mt-2">
                텍스트, SRT, 마크다운 파일을 업로드하면 AI가 자동으로 분석합니다
              </p>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 핵심 포인트 추출</li>
              <li>• 액션 아이템 정리</li>
              <li>• 참석자 및 키워드 분석</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <span className="text-2xl mr-3">📊</span>
                개인 대시보드
              </h3>
              <p className="text-gray-600 mt-2">
                누적된 미팅 데이터를 통해 개인 맞춤형 인사이트를 제공합니다
              </p>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 키워드 연결 맵</li>
              <li>• 프로젝트별 통계</li>
              <li>• AI 추천 콘텐츠</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <span className="text-2xl mr-3">🔗</span>
                쉬운 공유
              </h3>
              <p className="text-gray-600 mt-2">
                분석 결과를 팀원들과 쉽게 공유할 수 있습니다
              </p>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• SNS 직접 공유</li>
              <li>• 링크 복사</li>
              <li>• 자동 바이럴 기능</li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 border">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            지금 바로 시작해보세요
          </h3>
          <p className="text-gray-600 mb-8">
            첫 번째 미팅 분석은 무료입니다. 회원가입 없이도 바로 체험할 수 있어요.
          </p>
          <button className="px-12 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg">
            첫 미팅 분석하기
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 JARVIS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
