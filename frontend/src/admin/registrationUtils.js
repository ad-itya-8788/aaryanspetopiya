export function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

export function paginationItems(currentPage, lastPage) {
  if (lastPage <= 7) return Array.from({ length: lastPage }, (_, index) => index + 1);
  const pages = [
    ...new Set([1, 2, currentPage - 1, currentPage, currentPage + 1, lastPage - 1, lastPage]),
  ]
    .filter((page) => page >= 1 && page <= lastPage)
    .sort((left, right) => left - right);
  return pages.reduce((items, page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) items.push(`ellipsis-${page}`);
    items.push(page);
    return items;
  }, []);
}
