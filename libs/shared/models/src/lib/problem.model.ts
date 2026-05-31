/**
 * Réponse d'erreur RFC 9457 (Problem Details for HTTP APIs)
 * Retournée par tous les microservices SMS
 */
export interface IProblem {
  type:     string;
  title:    string;
  status:   number;
  detail:   string;
  instance: string;
  /** Champs de validation (422) */
  errors?:  IFieldError[];
}

export interface IFieldError {
  field:   string;
  message: string;
}
