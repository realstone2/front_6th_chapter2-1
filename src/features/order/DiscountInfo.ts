interface DiscountInfoProps {
  discRate: number;
  savedAmount: number;
}

/**
 * 할인 정보 컴포넌트
 * @param props - 컴포넌트 props
 * @param props.discRate - 할인율 (0~1)
 * @param props.savedAmount - 절약된 금액
 * @returns 할인 정보 HTML 문자열
 */
export function DiscountInfo(props: DiscountInfoProps): string {
  const { discRate, savedAmount } = props;

  return `
    <div class="bg-green-500/20 rounded-lg p-3">
      <div class="flex justify-between items-center mb-1">
        <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
        <span class="text-sm font-medium text-green-400">${(discRate * 100).toFixed(1)}%</span>
      </div>
      <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
    </div>
  `;
}
