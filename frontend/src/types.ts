export type Data = Array<Record<string, string>>;

export type ApiUploadResponse = {
  data: Data;
  error?: string;
};

export type ApiSearchResponse = {
  data: Data;
};