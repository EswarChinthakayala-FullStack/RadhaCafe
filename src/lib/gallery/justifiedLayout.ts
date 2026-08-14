export interface JustifiedLayoutItem<T = any> {
  item: T;
  width: number;
  height: number;
  aspectRatio: number;
  originalIndex: number;
}

export interface JustifiedRow<T = any> {
  height: number;
  items: JustifiedLayoutItem<T>[];
}

export interface JustifiedLayoutOptions {
  containerWidth: number;
  targetRowHeight?: number;
  gap?: number;
  maxRowHeightScale?: number;
  aspectRatioOverrides?: Record<string, number>;
}

/**
 * Google Photos–Style Justified Grid Algorithm
 *
 * Computes tight, balanced image rows where images preserve their natural
 * aspect ratios and proportionally fill the available container width.
 */
export function calculateJustifiedLayout<
  T extends { id: string; width?: number | null; height?: number | null }
>(
  items: T[],
  options: JustifiedLayoutOptions
): JustifiedRow<T>[] {
  const {
    containerWidth,
    targetRowHeight = 240,
    gap = 6,
    maxRowHeightScale = 1.38,
    aspectRatioOverrides = {},
  } = options;

  if (!items || items.length === 0 || containerWidth <= 0) {
    return [];
  }

  // Helper to extract aspect ratio with safety bounds
  const getAspectRatio = (item: T): number => {
    if (aspectRatioOverrides[item.id] && aspectRatioOverrides[item.id] > 0) {
      return Math.min(Math.max(aspectRatioOverrides[item.id], 0.45), 3.2);
    }
    if (item.width && item.height && item.width > 0 && item.height > 0) {
      return Math.min(Math.max(item.width / item.height, 0.45), 3.2);
    }
    // Standard default 4:3 landscape fallback
    return 1.3333;
  };

  const rows: JustifiedRow<T>[] = [];
  let currentRow: { item: T; aspectRatio: number; originalIndex: number }[] = [];
  let currentAspectSum = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const ar = getAspectRatio(item);

    currentRow.push({ item, aspectRatio: ar, originalIndex: i });
    currentAspectSum += ar;

    const itemCount = currentRow.length;
    const totalGaps = (itemCount - 1) * gap;
    const availableWidth = containerWidth - totalGaps;
    const candidateHeight = availableWidth / currentAspectSum;

    // Check if adding this item fills the row near or below target height
    if (candidateHeight <= targetRowHeight * 1.15) {
      // Row is full enough to justify
      const finalHeight = Math.round(candidateHeight);
      const rowItems: JustifiedLayoutItem<T>[] = [];
      let totalAssignedWidth = 0;

      for (let j = 0; j < currentRow.length; j++) {
        const rItem = currentRow[j];
        const isLastInRow = j === currentRow.length - 1;
        let itemWidth = Math.floor(finalHeight * rItem.aspectRatio);

        if (isLastInRow) {
          // Adjust last item to consume exact pixel remainder
          itemWidth = availableWidth - totalAssignedWidth;
        } else {
          totalAssignedWidth += itemWidth;
        }

        rowItems.push({
          item: rItem.item,
          width: Math.max(itemWidth, 40),
          height: finalHeight,
          aspectRatio: rItem.aspectRatio,
          originalIndex: rItem.originalIndex,
        });
      }

      rows.push({ height: finalHeight, items: rowItems });
      currentRow = [];
      currentAspectSum = 0;
    }
  }

  // Handle remaining items in the last row
  if (currentRow.length > 0) {
    const itemCount = currentRow.length;
    const totalGaps = (itemCount - 1) * gap;
    const availableWidth = containerWidth - totalGaps;
    const candidateHeight = availableWidth / currentAspectSum;

    // If leftover row can justify without stretching excessively
    if (candidateHeight <= targetRowHeight * maxRowHeightScale && itemCount >= 3) {
      const finalHeight = Math.round(candidateHeight);
      const rowItems: JustifiedLayoutItem<T>[] = [];
      let totalAssignedWidth = 0;

      for (let j = 0; j < currentRow.length; j++) {
        const rItem = currentRow[j];
        const isLastInRow = j === currentRow.length - 1;
        let itemWidth = Math.floor(finalHeight * rItem.aspectRatio);

        if (isLastInRow) {
          itemWidth = availableWidth - totalAssignedWidth;
        } else {
          totalAssignedWidth += itemWidth;
        }

        rowItems.push({
          item: rItem.item,
          width: Math.max(itemWidth, 40),
          height: finalHeight,
          aspectRatio: rItem.aspectRatio,
          originalIndex: rItem.originalIndex,
        });
      }

      rows.push({ height: finalHeight, items: rowItems });
    } else {
      // Left-align at standard targetRowHeight without stretching
      const finalHeight = targetRowHeight;
      const rowItems: JustifiedLayoutItem<T>[] = currentRow.map((rItem) => {
        const itemWidth = Math.round(finalHeight * rItem.aspectRatio);
        return {
          item: rItem.item,
          width: Math.min(itemWidth, containerWidth),
          height: finalHeight,
          aspectRatio: rItem.aspectRatio,
          originalIndex: rItem.originalIndex,
        };
      });

      rows.push({ height: finalHeight, items: rowItems });
    }
  }

  return rows;
}
