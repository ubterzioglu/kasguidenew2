import fetch from 'node-fetch'
async function run() {
  const res = await fetch('http://localhost:3000/api/admin/review?limit=1000', {
    headers: { 'X-Admin-Password': 'test' } // the app is running locally, we need the actual admin password or we bypass
  })
  console.log(res.status)
}
run()
