import { Header } from '../header/Header.ts';
import { GridContainer } from './GridContainer.ts';
import { ManualToggle } from '../help/ManualToggle.ts';
import { ManualOverlay } from '../help/ManualOverlay.ts';

/**
 * 앱 컴포넌트
 * @returns 앱 DOM Element
 */
export function App(): HTMLElement {
  const app = document.createElement('div');
  app.id = 'app';
  app.className = 'min-h-screen bg-gray-100 flex flex-col';

  // 헤더 생성 및 추가
  const header = Header({ itemCount: 0 });
  app.appendChild(header);

  // 그리드 컨테이너 생성 및 추가
  const gridContainer = GridContainer();
  app.appendChild(gridContainer);

  // 매뉴얼 토글 버튼 생성 및 추가
  const manualToggle = ManualToggle();
  app.appendChild(manualToggle);

  // 매뉴얼 오버레이 생성 및 추가
  const manualOverlay = ManualOverlay();
  app.appendChild(manualOverlay);

  return app;
}
