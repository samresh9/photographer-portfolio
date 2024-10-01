// export const paginationMetadata = (
//   page
//   limit
// ) => {

import { PaginationMetadata } from "../common/types";

//     const totalPage = Math.ceil(totalData / limit);
//     const startIndex = (page - 1) * limit;
//   const skip = (pageNumber - 1) * pageSize;

//   return { pageNumber, pageSize, skip };
// };

export const paginationMetadata = (
  totalData: number,
  limit: number,
  page: number,
): PaginationMetadata => {
  const totalPage = Math.ceil(totalData / limit);
  const metadata = {
    totalPage,
    totalData,
    perPage: limit,
    currentPage: page,
    nextPage: page >= totalPage || totalPage == 1 ? null : page + 1,
    previousPage: page === 1 || page > totalPage + 1 ? null : page - 1,
  };
  return metadata;
};
