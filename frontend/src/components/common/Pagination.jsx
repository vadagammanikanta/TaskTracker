export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          className={`btn ${page === currentPage ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
