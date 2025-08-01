import React, { useEffect } from 'react';
import { Provider } from 'jotai';
import { Header } from './components/Header';
import { GridContainer } from './components/GridContainer';
import { ManualSection } from './features/cart/ManualSection';
import { useCartViewModel } from './viewmodels/useCartViewModel';
import { useProductViewModel } from './viewmodels/useProductViewModel';

/**
 * 앱 컨텐츠 컴포넌트 (Jotai Provider 내부)
 */
const AppContent: React.FC = () => {
  const cartViewModel = useCartViewModel();
  const productViewModel = useProductViewModel();

  // 앱 시작 시 타이머 시작
  useEffect(() => {
    productViewModel.startLightningSaleTimer();
    productViewModel.startSuggestedSaleTimer();

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      productViewModel.clearAllTimers();
    };
  }, []);

  return (
    <div id="app" className="min-h-screen bg-gray-100 flex flex-col">
      {/* 헤더 */}
      <Header />

      {/* 그리드 컨테이너 */}
      <GridContainer />

      {/* 매뉴얼 섹션 */}
      <ManualSection />
    </div>
  );
};

/**
 * 메인 앱 컴포넌트 (Jotai Provider 래핑)
 * @returns 앱 JSX 엘리먼트
 */
const App: React.FC = () => {
  return (
    <Provider>
      <AppContent />
    </Provider>
  );
};

export default App;
