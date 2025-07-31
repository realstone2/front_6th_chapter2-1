import React from 'react';
import { Header } from './components/Header';
import { GridContainer } from './components/GridContainer';
import { ManualSection } from './features/cart/ManualSection';

/**
 * 메인 앱 컴포넌트
 * @returns 앱 JSX 엘리먼트
 */
const App: React.FC = () => {
  // TODO: 아이템 카운트 상태 관리는 다음 Phase에서 구현
  const itemCount = 0;

  return (
    <div id="app" className="min-h-screen bg-gray-100 flex flex-col">
      {/* 헤더 */}
      <Header itemCount={itemCount} />

      {/* 그리드 컨테이너 */}
      <GridContainer />

      {/* 매뉴얼 섹션 */}
      <ManualSection />
    </div>
  );
};

export default App;
