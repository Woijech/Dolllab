async function getUserTheme() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://localhost:7145/api/settings/theme", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) return "light";

  const data = await res.json();
  return data.theme || "light";
}

async function updateUserTheme(theme) {
  const token = localStorage.getItem("token");

  const res = await fetch("https://localhost:7145/api/settings/theme", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ theme })
  });

  if (!res.ok) {
    alert(await res.text());
    return null;
  }

  return await res.json();
}