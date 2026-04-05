// Quick seed script — just hits the seed endpoint
const PORT = process.env.PORT || 5000;
fetch(`http://localhost:${PORT}/api/seed`)
    .then(r => r.json())
    .then(d => { console.log(d); process.exit(0); })
    .catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
