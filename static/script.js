/* ─── script.js ─ Heart Disease Prediction UI Logic ─────────── */

// ─── Pulse Graph Data ──────────────────────────────────────────
const pulseHistory = [];
const MAX_PULSE = 20;

// ─── Helpers ──────────────────────────────────────────────────
function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── Health Monitor ───────────────────────────────────────────
async function checkHealth() {
    const statusEl       = document.getElementById('api-status');
    const latencyEl      = document.getElementById('api-latency');
    const lastCheckedEl  = document.getElementById('api-last-checked');
    const heroDot        = document.getElementById('hero-status-dot');
    const heroText       = document.getElementById('hero-status-text');

    statusEl.textContent = 'Checking…';
    statusEl.className   = 'stat-value status-badge checking';

    const t0 = performance.now();
    try {
        const res    = await fetch('/health');
        const ms     = Math.round(performance.now() - t0);
        const ok     = res.ok;

        statusEl.textContent = ok ? 'ONLINE' : 'DEGRADED';
        statusEl.className   = `stat-value status-badge ${ok ? 'online' : 'offline'}`;
        latencyEl.textContent  = `${ms} ms`;
        lastCheckedEl.textContent = now();

        heroDot.className = `status-dot ${ok ? 'online' : 'offline'}`;
        heroText.textContent = ok ? 'API Online' : 'API Degraded';

        pulseHistory.push({ ms, ok });
        if (pulseHistory.length > MAX_PULSE) pulseHistory.shift();
        drawPulse();
    } catch {
        statusEl.textContent = 'OFFLINE';
        statusEl.className   = 'stat-value status-badge offline';
        latencyEl.textContent  = '—';
        lastCheckedEl.textContent = now();

        heroDot.className  = 'status-dot offline';
        heroText.textContent = 'API Offline';

        pulseHistory.push({ ms: 0, ok: false });
        if (pulseHistory.length > MAX_PULSE) pulseHistory.shift();
        drawPulse();
    }
}

// ─── Model Info ───────────────────────────────────────────────
async function fetchModelInfo() {
    const modelTypeEl  = document.getElementById('model-type');
    const countEl      = document.getElementById('feature-count');
    const listEl       = document.getElementById('feature-list');

    try {
        const res  = await fetch('/info');
        const data = await res.json();

        modelTypeEl.textContent = data.model_type ?? '—';
        const features = data.features ?? [];
        countEl.textContent = features.length;

        listEl.innerHTML = '';
        features.forEach(f => {
            const chip = document.createElement('span');
            chip.className = 'feature-chip';
            chip.textContent = f.toUpperCase();
            listEl.appendChild(chip);
        });
    } catch {
        modelTypeEl.textContent = 'Unavailable';
        countEl.textContent = '—';
    }
}

// ─── Pulse Canvas ─────────────────────────────────────────────
function drawPulse() {
    const canvas = document.getElementById('pulse-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (pulseHistory.length < 2) return;

    const maxMs = Math.max(...pulseHistory.map(p => p.ms), 200);
    const step  = W / (MAX_PULSE - 1);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        const y = (H / 4) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Draw filled area
    ctx.beginPath();
    ctx.moveTo(0, H);
    pulseHistory.forEach((p, i) => {
        const x = i * step;
        const y = H - (p.ms / maxMs) * (H - 8) - 4;
        if (i === 0) ctx.lineTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.lineTo((pulseHistory.length - 1) * step, H);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(99,102,241,0.4)');
    grad.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    pulseHistory.forEach((p, i) => {
        const x = i * step;
        const y = H - (p.ms / maxMs) * (H - 8) - 4;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = pulseHistory.at(-1).ok ? '#818cf8' : '#f87171';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Draw last dot
    const last = pulseHistory.at(-1);
    const lx   = (pulseHistory.length - 1) * step;
    const ly   = H - (last.ms / maxMs) * (H - 8) - 4;
    ctx.beginPath();
    ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fillStyle = last.ok ? '#818cf8' : '#f87171';
    ctx.fill();
}

// ─── Combined Monitor Refresh ─────────────────────────────────
async function refreshMonitor() {
    await Promise.all([checkHealth(), fetchModelInfo()]);
}

// ─── Prediction Form ──────────────────────────────────────────
const form      = document.getElementById('prediction-form');
const predictBtn = document.getElementById('predict-btn');
const resultArea = document.getElementById('result-area');
const resultCard = document.getElementById('result-card');
const resultIcon = document.getElementById('result-icon');
const resultText = document.getElementById('result-text');
const resultDesc = document.getElementById('result-desc');
const errorArea  = document.getElementById('error-area');
const errorText  = document.getElementById('error-text');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Loading state
    predictBtn.disabled = true;
    predictBtn.classList.add('loading');
    predictBtn.querySelector('.btn-text').textContent = 'Analyzing';
    resultArea.classList.add('hidden');
    errorArea.classList.add('hidden');

    const fields = ['age','sex','cp','trestbps','chol','fbs','restecg','thalach','exang','oldpeak','slope','ca','thal'];
    const payload = {};
    fields.forEach(f => { payload[f] = parseFloat(form.elements[f].value); });

    try {
        const res  = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail ?? `HTTP ${res.status}`);
        }

        const data = await res.json();
        const isRisk = data.heart_disease;

        resultCard.className = `result-card ${isRisk ? 'high-risk' : 'low-risk'}`;
        resultIcon.textContent = isRisk ? '⚠️' : '✅';
        resultText.textContent = isRisk ? 'High Risk Detected' : 'Low Risk Detected';
        resultDesc.textContent = isRisk
            ? 'The model predicts a significant likelihood of heart disease. Please consult a cardiologist for further evaluation.'
            : 'The model predicts a low likelihood of heart disease. Regular check-ups are still recommended.';

        resultArea.classList.remove('hidden');
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (err) {
        errorText.textContent = `Error: ${err.message}`;
        errorArea.classList.remove('hidden');
    } finally {
        predictBtn.disabled = false;
        predictBtn.classList.remove('loading');
        predictBtn.querySelector('.btn-text').textContent = 'Analyze Risk';
    }
});

// ─── Sample Patient Data ──────────────────────────────────────
document.getElementById('fill-sample-btn').addEventListener('click', () => {
    const sample = {
        age: 63, sex: 1, cp: 3, trestbps: 145, chol: 233,
        fbs: 1, restecg: 0, thalach: 150, exang: 0,
        oldpeak: 2.3, slope: 0, ca: 0, thal: 1,
    };
    Object.entries(sample).forEach(([key, val]) => {
        const el = form.elements[key];
        if (el) el.value = val;
    });
});

// ─── Init ─────────────────────────────────────────────────────
refreshMonitor();
setInterval(checkHealth, 10000); // poll health every 10s

// Smooth nav active on scroll
const sections = document.querySelectorAll('section[id]');
const navPills = document.querySelectorAll('.nav-pill[href^="#"]');
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            navPills.forEach(pill => {
                pill.classList.toggle('active', pill.getAttribute('href') === `#${id}`);
            });
        }
    });
}, { threshold: 0.4 });
sections.forEach(s => observer.observe(s));
