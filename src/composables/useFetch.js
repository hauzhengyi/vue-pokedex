export async function useFetchGet(url, params) {
  let data = null;
  let error = null;

  try {
    data = await fetch(url + "?" + new URLSearchParams(params)).then((res) =>
      res.json()
    );
  } catch (err) {
    error = err;
  }

  return { data, error };
}
