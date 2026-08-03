const $ = (selector) => document.querySelector(selector);
let accessToken = localStorage.getItem('travelbd_access_token') || '';

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const response = await fetch(path, { ...options, headers });
  const payload = await response.json().catch(() => ({ success: false, message: 'Invalid response.' }));
  if (!response.ok) throw new Error(payload.message || 'Request failed.');
  return payload;
}

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

async function loadSpots() {
  const grid = $('#spotGrid');
  grid.innerHTML = '<p>Loading tourist spots…</p>';
  try {
    const payload = await api('/api/spots?featured=true');
    const spots = payload.data.length ? payload.data : (await api('/api/spots?isNew=true')).data;
    grid.innerHTML = spots.map((spot) => `
      <article class="spot-card">
        <img src="${spot.coverImage || 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=70'}" alt="${spot.name}" />
        <div class="spot-card__body">
          <h3>${spot.name}</h3>
          <p>${spot.shortDescription || spot.description.slice(0, 120)}</p>
          <p><strong>${spot.districtName}</strong> · Rating ${spot.ratingAverage || 'New'} · Entry ৳${spot.entryFee}</p>
          <div class="tags">${spot.categories.map((category) => `<span class="tag">${category}</span>`).join('')}</div>
        </div>
      </article>
    `).join('');
  } catch (error) {
    grid.innerHTML = `<p>${error.message}</p>`;
  }
}

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const payload = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: $('#email').value, password: $('#password').value })
    });
    accessToken = payload.data.accessToken;
    localStorage.setItem('travelbd_access_token', accessToken);
    $('#loginStatus').textContent = `Logged in as ${payload.data.user.fullName} (${payload.data.user.role}).`;
  } catch (error) {
    $('#loginStatus').textContent = error.message;
  }
});

$('#routeForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const output = $('#routeOutput');
  output.textContent = 'Generating route…';
  try {
    const payload = await api('/api/routes/recommend', {
      method: 'POST',
      body: JSON.stringify({
        startLat: Number($('#startLat').value),
        startLng: Number($('#startLng').value),
        maxStops: Number($('#maxStops').value),
        budget: Number($('#budget').value),
        interests: ['heritage', 'city attraction'],
        includeNew: true,
        vehiclePriority: 'balanced'
      })
    });
    output.textContent = pretty(payload.data);
  } catch (error) {
    output.textContent = error.message;
  }
});

$('#costForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const output = $('#costOutput');
  output.textContent = 'Estimating…';
  try {
    const payload = await api('/api/vehicles/estimate-cost', {
      method: 'POST',
      body: JSON.stringify({
        distanceKm: Number($('#distanceKm').value),
        passengers: Number($('#passengers').value),
        priority: $('#priority').value
      })
    });
    output.textContent = pretty(payload.data);
  } catch (error) {
    output.textContent = error.message;
  }
});

$('#loadSpots').addEventListener('click', loadSpots);
$('#healthCheck').addEventListener('click', async () => {
  try {
    const payload = await api('/api/health');
    alert(`${payload.message}\n${payload.timestamp}`);
  } catch (error) {
    alert(error.message);
  }
});

loadSpots();
