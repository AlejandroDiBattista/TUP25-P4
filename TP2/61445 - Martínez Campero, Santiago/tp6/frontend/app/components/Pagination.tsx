'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages,
  onPageChange 
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      const params = new URLSearchParams(searchParams);
      params.set('page', page.toString());
      router.push(`?${params.toString()}`);
    }
  };

  if (totalPages <= 1) return null;

  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      <Button
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        variant={currentPage === 1 ? 'outline' : 'default'}
      >
        Primera
      </Button>

      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
      >
        ← Anterior
      </Button>

      <div className="flex gap-1">
        {startPage > 1 && (
          <>
            <Button
              onClick={() => handlePageChange(1)}
              variant="outline"
            >
              1
            </Button>
            {startPage > 2 && (
              <span className="px-2 py-2 text-gray-500">...</span>
            )}
          </>
        )}

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
          const page = startPage + i;
          return (
            <Button
              key={page}
              onClick={() => handlePageChange(page)}
              variant={currentPage === page ? 'default' : 'outline'}
              className={currentPage === page ? 'bg-primary' : ''}
            >
              {page}
            </Button>
          );
        })}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 py-2 text-gray-500">...</span>
            )}
            <Button
              onClick={() => handlePageChange(totalPages)}
              variant="outline"
            >
              {totalPages}
            </Button>
          </>
        )}
      </div>

      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
      >
        Siguiente →
      </Button>

      <Button
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        variant={currentPage === totalPages ? 'outline' : 'default'}
      >
        Última
      </Button>
    </div>
  );
}
