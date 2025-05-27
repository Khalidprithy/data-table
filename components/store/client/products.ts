export const getProducts = async ({
  query = '',
  page = 1,
  pageSize = 10,
}: {
  query?: string;
  page?: number;
  pageSize?: number;
}) => {
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/products`);
  url.searchParams.set('search', query);
  url.searchParams.set('skip', String(skip));
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};
