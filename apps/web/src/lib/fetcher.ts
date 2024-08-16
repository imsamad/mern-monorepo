export const fetcher = async (
  pathname: string,
  method: "PUT" | "GET" | "POST" | "DELETE",
  body?: Object,
) => {
  const url = process.env.NEXT_PUBLIC_API_URL + pathname;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: !body ? undefined : JSON.stringify(body),
  });

  const data = await res.json();

  if (res.ok) return data;

  throw data;
};
