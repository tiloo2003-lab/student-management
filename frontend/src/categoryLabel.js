// Display alias only: preserve category IDs, slugs and stored names.
export function categoryLabel(category) {
  return category?.slug === 'announcements' ? 'School news' : (category?.name || '');
}
