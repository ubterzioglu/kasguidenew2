async function run() {
  const res = await fetch("http://localhost:3000/api/admin/review?limit=276", {
    headers: { "X-Admin-Password": "6641245" }
  });
  if (res.ok) {
    const data = await res.json();
    console.log("Raw results:", data.rawResults?.length);
  } else {
    console.log("Error:", await res.text());
  }
}
run();
