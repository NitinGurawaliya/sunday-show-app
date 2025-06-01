export type DatabaseQueryResponseType = {
  data?: any;
  error?: any;
};
export interface ClientAPIResponse {
  status: boolean;
  data?: any;
}
export interface APIResponseType extends ClientAPIResponse {
  message?: string;
  error?: any;
}