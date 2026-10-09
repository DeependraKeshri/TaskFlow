import api from "./axios";

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
}

export async function searchUsers(
  query: string
): Promise<UserSearchResult[]> {
  const response = await api.get<UserSearchResult[]>(
    "/users/search",
    {
      params: {
        query,
      },
    }
  );

  return response.data;
}
