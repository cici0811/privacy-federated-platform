async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function main() {
  const base = 'http://localhost:3001/api/demo/he';
  const a = await post(`${base}/encrypt`, { value: 3 });
  const b = await post(`${base}/encrypt`, { value: 5 });
  const s = await post(`${base}/add`, { cipherA: a.ciphertext, cipherB: b.ciphertext });
  const d = await post(`${base}/decrypt`, { ciphertext: s.resultCipher });
  console.log({ a, b, s, d });
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
