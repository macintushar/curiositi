export type ApiResponse<T> = {
  data: T;
  error: string | null;
};

export type MessageResponse = {
  message: string;
};
