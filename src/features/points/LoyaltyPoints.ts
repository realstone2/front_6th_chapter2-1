interface LoyaltyPointsProps {
  bonusPoints: number;
  pointsDetail: string[];
}

/**
 * 적립 포인트 컴포넌트
 * @param props - 컴포넌트 props
 * @param props.bonusPoints - 보너스 포인트
 * @param props.pointsDetail - 포인트 상세 내역
 * @returns 적립 포인트 DOM Element
 */
export function LoyaltyPoints(props: LoyaltyPointsProps): HTMLElement {
  const { bonusPoints, pointsDetail } = props;

  const element = document.createElement('div');
  element.id = 'loyalty-points';
  element.className = 'text-xs text-blue-400 mt-2 text-right';

  if (bonusPoints > 0) {
    element.innerHTML = `
      <div>적립 포인트: <span class="font-bold">${bonusPoints}p</span></div>
      <div class="text-2xs opacity-70 mt-1">${pointsDetail.join(', ')}</div>
    `;
  } else {
    element.textContent = '적립 포인트: 0p';
  }

  return element;
}
