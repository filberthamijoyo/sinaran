'use client';

import { useCallback } from 'react';

interface UseDataGridKeyboardProps {
  rowsCount: number;
  columnsCount: number;
  focusCell: (rowIndex: number, colIndex: number) => void;
  addRow: () => void;
}

export const useDataGridKeyboard = ({
  rowsCount,
  columnsCount,
  focusCell,
  addRow,
}: UseDataGridKeyboardProps) => {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
      const { key } = event;
      const lastRowIndex = rowsCount - 1;
      const lastColIndex = columnsCount - 1;

      if (key === 'ArrowRight') {
        event.preventDefault();
        const nextCol = Math.min(colIndex + 1, lastColIndex);
        focusCell(rowIndex, nextCol);
      } else if (key === 'ArrowLeft') {
        event.preventDefault();
        const prevCol = Math.max(colIndex - 1, 0);
        focusCell(rowIndex, prevCol);
      } else if (key === 'ArrowDown') {
        event.preventDefault();
        const nextRow = Math.min(rowIndex + 1, lastRowIndex);
        focusCell(nextRow, colIndex);
      } else if (key === 'ArrowUp') {
        event.preventDefault();
        const prevRow = Math.max(rowIndex - 1, 0);
        focusCell(prevRow, colIndex);
      } else if (key === 'Enter') {
        if (rowIndex === lastRowIndex && colIndex === lastColIndex) {
          event.preventDefault();
          addRow();
          focusCell(0, 0);
        } else {
          event.preventDefault();
          const nextCol = colIndex === lastColIndex ? 0 : colIndex + 1;
          const nextRow = colIndex === lastColIndex ? Math.min(rowIndex + 1, lastRowIndex) : rowIndex;
          focusCell(nextRow, nextCol);
        }
      }
    },
    [rowsCount, columnsCount, focusCell, addRow],
  );

  return { handleKeyDown };
};
