/**
 * Réponse paginée Spring Data (Page<T>)
 */
export interface IPage<T> {
  content:          T[];
  totalElements:    number;
  totalPages:       number;
  size:             number;
  number:           number;
  numberOfElements: number;
  first:            boolean;
  last:             boolean;
  empty:            boolean;
}

/**
 * Paramètres de pagination pour les requêtes HTTP
 */
export interface IPageRequest {
  page:  number;
  size:  number;
  sort?: string;
}
