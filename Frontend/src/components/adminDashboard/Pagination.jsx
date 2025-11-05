import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function Pagination({
  theme,
  currentPage,
  totalPages,
  totalResults,
  goToPage,
  goToPrevPage,
  goToNextPage,
  getPageNumbers
}) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers ? getPageNumbers() : [];
  const startItem = ((currentPage - 1) * 10) + 1;
  const endItem = Math.min(currentPage * 10, totalResults);

  return (
    <div className={`pagination-container ${theme}`}>
      {/* Results Info */}
      <div className="pagination-info">
        <span>
          Showing {startItem} to {endItem} of {totalResults} results
        </span>
      </div>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        {/* Previous Button */}
        <button
          className={`pagination-btn ${theme} ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {/* First Page */}
        {pageNumbers[0] > 1 && (
          <>
            <button
              className={`pagination-btn ${theme}`}
              onClick={() => goToPage(1)}
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span className="pagination-ellipsis">...</span>
            )}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((page) => (
          <button
            key={page}
            className={`pagination-btn ${theme} ${currentPage === page ? 'active' : ''}`}
            onClick={() => goToPage(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        {/* Last Page */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="pagination-ellipsis">...</span>
            )}
            <button
              className={`pagination-btn ${theme}`}
              onClick={() => goToPage(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          className={`pagination-btn ${theme} ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* Page Info */}
      <div className="pagination-page-info">
        <span>Page {currentPage} of {totalPages}</span>
      </div>
    </div>
  );
}