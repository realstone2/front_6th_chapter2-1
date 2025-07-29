interface LoyaltyPointsProps {
  bonusPoints: number;
  pointsDetail: string[];
}

/**
 * 적립 포인트 컴포넌트
 * @param props - 컴포넌트 props
 * @param props.bonusPoints - 보너스 포인트
 * @param props.pointsDetail - 포인트 상세 내역
 * @returns 적립 포인트 HTML 문자열
 */
export function LoyaltyPoints(props: LoyaltyPointsProps): string {
  const { bonusPoints, pointsDetail } = props;

  if (bonusPoints > 0) {
    return `
      <div>적립 포인트: <span class="font-bold">${bonusPoints}p</span></div>
      <div class="text-2xs opacity-70 mt-1">${pointsDetail.join(', ')}</div>
    `;
  } else {
    return '적립 포인트: 0p';
  }
}
