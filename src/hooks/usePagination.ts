import { useState, useMemo } from 'react';

interface UsePaginationOptions<T> {
  data: T[];
  itemsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  paginatedData: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setItemsPerPage: (count: number) => void;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function usePagination<T>({ data, itemsPerPage: initialItemsPerPage = 10 }: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  // Reset to page 1 if data changes and current page is out of bounds
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  if (safePage !== currentPage && totalPages > 0) {
    setCurrentPage(safePage);
  }

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, safePage, itemsPerPage]);

  const goToPage = (page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clampedPage);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const setItemsPerPage = (count: number) => {
    setItemsPerPageState(count);
    setCurrentPage(1);
  };

  const startIndex = (safePage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(safePage * itemsPerPage, data.length);

  return {
    currentPage: safePage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    itemsPerPage,
    startIndex,
    endIndex,
    totalItems: data.length,
  };
}
