document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // 1. CONFIGURATION & AUTHENTICATION
    // ============================================================
    const API_BASE = 'http://localhost:5075/api'; 
    let token = localStorage.getItem('jwt_token');

    // Global Auth Check: Redirect to login if no token (except on public pages)
    const isPublicPage = window.location.href.includes('login.html') || window.location.href.includes('take_survey.html');
    
    if (!token && !isPublicPage) {
        window.location.href = 'login.html';
        return; // Stop execution
    }

    // --- Helper: Authenticated Fetch ---
    // Automatically adds the JWT token to requests and handles expiration
    async function authFetch(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };
        
        try {
            const response = await fetch(url, { ...options, headers });
            
            if (response.status === 401) {
                alert("Session expired. Please login again.");
                localStorage.removeItem('jwt_token');
                window.location.href = 'login.html';
                return null;
            }
            return response;
        } catch (error) {
            console.error("Network Error:", error);
            alert("Backend unreachable or network error.");
            return null;
        }
    }

    // ============================================================
    // 2. GLOBAL UI (Sidebar, Logout)
    // ============================================================
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

    // Add a Logout capability if you add a button with id="logout-btn"
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_role');
            window.location.href = 'login.html';
        });
    }

    // ============================================================
    // 3. LOGIN PAGE LOGIC
    // ============================================================
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('error-msg');

            try {
                // Public endpoint, so we use standard fetch
                const res = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ email, password })
                });
                
                if(res.ok) {
                    const data = await res.json();
                    localStorage.setItem('jwt_token', data.token);
                    localStorage.setItem('user_role', data.user.role || 'Analyst');
                    window.location.href = 'index.html';
                } else {
                    if(errorMsg) {
                        errorMsg.innerText = "Invalid email or password";
                        errorMsg.classList.remove('hidden');
                    } else {
                        alert('Invalid Credentials');
                    }
                }
            } catch(e) { 
                console.error(e); 
                alert('Server Connection Error'); 
            }
        });
    }

    // ============================================================
    // 4. SURVEY BUILDER (surveys.html)
    // ============================================================
    const dropZone = document.getElementById('drop-zone');
    const publishBtn = document.getElementById('publish-btn');
    let questions = [];

    if (dropZone) {
        // --- Drag & Drop Events ---
        document.querySelectorAll('.draggable-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('type', e.target.getAttribute('data-type'));
            });
        });

        dropZone.addEventListener('dragover', (e) => { 
            e.preventDefault(); 
            dropZone.classList.add('bg-blue-50', 'border-blue-300'); 
        });
        
        dropZone.addEventListener('dragleave', () => { 
            dropZone.classList.remove('bg-blue-50', 'border-blue-300'); 
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-blue-50', 'border-blue-300');
            const type = e.dataTransfer.getData('type');
            if(type) addQuestion(type);
        });
    }

    function addQuestion(type) {
        document.getElementById('empty-msg')?.remove();
        const id = Date.now();
        let html = '', label = '';

        // Define Question UI based on Type
        if (type === 'nps') {
            label = "How likely are you to recommend us?";
            html = `<div class="bg-white border p-4 mb-4 rounded-lg shadow-sm" id="q-${id}">
                        <div class="flex justify-between mb-2">
                            <span class="font-bold text-blue-600">🔢 NPS (0-10)</span> 
                            <button onclick="delQ(${id})" class="text-red-500 text-xs hover:underline">Delete</button>
                        </div>
                        <input class="w-full border p-2 rounded text-sm" value="${label}" onchange="updQ(${id}, this.value)">
                    </div>`;
        } else if (type === 'csat') {
            label = "How satisfied are you?";
            html = `<div class="bg-white border p-4 mb-4 rounded-lg shadow-sm" id="q-${id}">
                        <div class="flex justify-between mb-2">
                            <span class="font-bold text-yellow-600">⭐ CSAT (1-5)</span> 
                            <button onclick="delQ(${id})" class="text-red-500 text-xs hover:underline">Delete</button>
                        </div>
                        <input class="w-full border p-2 rounded text-sm" value="${label}" onchange="updQ(${id}, this.value)">
                    </div>`;
        } else if (type === 'text') {
            label = "Any additional comments?";
            html = `<div class="bg-white border p-4 mb-4 rounded-lg shadow-sm" id="q-${id}">
                        <div class="flex justify-between mb-2">
                            <span class="font-bold text-gray-600">📝 Text Area</span> 
                            <button onclick="delQ(${id})" class="text-red-500 text-xs hover:underline">Delete</button>
                        </div>
                        <input class="w-full border p-2 rounded text-sm" value="${label}" onchange="updQ(${id}, this.value)">
                    </div>`;
        } else if (type === 'multi') {
            label = "Select an option";
            html = `<div class="bg-white border p-4 mb-4 rounded-lg shadow-sm" id="q-${id}">
                        <div class="flex justify-between mb-2">
                            <span class="font-bold text-green-600">✅ Multiple Choice</span> 
                            <button onclick="delQ(${id})" class="text-red-500 text-xs hover:underline">Delete</button>
                        </div>
                        <input class="w-full border p-2 rounded text-sm" value="${label}" onchange="updQ(${id}, this.value)">
                        <p class="text-xs text-gray-400 mt-1">(Options configuration not implemented in demo)</p>
                    </div>`;
        }

        dropZone.insertAdjacentHTML('beforeend', html);
        questions.push({ id, type, label });
    }

    // Global scope helpers for inline onclick events
    window.delQ = (id) => { 
        document.getElementById(`q-${id}`).remove(); 
        questions = questions.filter(q => q.id !== id);
        if(questions.length === 0) {
            dropZone.innerHTML = '<p id="empty-msg" class="text-center text-gray-400 text-sm mt-32 italic">Drag questions here...</p>';
        }
    };
    window.updQ = (id, val) => { 
        const q = questions.find(q => q.id === id);
        if(q) q.label = val; 
    };

    // --- QR Code Logic ---
    if(window.location.pathname.includes('surveys.html')) {
        const qrContainer = document.querySelector('.bg-gray-200.rounded'); 
        if(qrContainer) {
            const takeSurveyUrl = window.location.href.replace('surveys.html', 'take_survey.html');
            // Use a QR Code API
            qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(takeSurveyUrl)}" alt="QR Code" class="w-full h-full object-cover">`;
            
            // Update the text link below it
            const linkText = qrContainer.nextElementSibling;
            if(linkText && linkText.tagName === 'A') {
                linkText.href = takeSurveyUrl;
                linkText.innerText = "Link to Live Survey";
            }
        }
    }

    // --- Publish Survey ---
    if(publishBtn) {
        publishBtn.addEventListener('click', async () => {
            if (questions.length === 0) return alert("Please add at least one question.");
            const titleInput = document.getElementById('survey-title-input');
            const title = titleInput ? titleInput.value : "Untitled Survey";
            
            // Use authFetch to post securely
            const res = await authFetch(`${API_BASE}/surveys`, {
                method: 'POST',
                body: JSON.stringify({ title, isPublished: true, questionsJson: JSON.stringify(questions) })
            });
            
            if(res && res.ok) {
                alert('✅ Survey Published Successfully!');
                // Clear the builder
                questions = [];
                dropZone.innerHTML = '<p id="empty-msg" class="text-center text-gray-400 text-sm mt-32 italic">Drag questions here...</p>';
            } else {
                alert('❌ Error publishing survey.');
            }
        });
    }

    // ============================================================
    // 5. ANALYTICS & DASHBOARD (analytics.html / index.html)
    // ============================================================
    const trendCtx = document.getElementById('trendChart');
    const filterBtn = document.getElementById('apply-filters');
    const exportBtn = document.getElementById('export-btn');

    // Only run if we see the chart element
    if (trendCtx) {
        loadAnalytics();

        if(filterBtn) {
            filterBtn.addEventListener('click', () => {
                const loc = document.querySelector('select')?.value || ''; // specific selector logic
                // For demo, if you have a specific location dropdown:
                // const loc = document.getElementById('location-filter').value;
                loadAnalytics(loc);
            });
        }

        if(exportBtn) {
            exportBtn.addEventListener('click', exportCSV);
        }
    }

    async function loadAnalytics(location = '') {
        try {
            // 1. Fetch KPI Stats
            let url = `${API_BASE}/analytics/dashboard-stats`;
            if(location && location !== 'All Locations') url += `?location=${location}`;
            
            const statsRes = await authFetch(url);
            if(statsRes && statsRes.ok) {
                const stats = await statsRes.json();
                
                // Update Dashboard Cards (ensure IDs exist in HTML)
                const totalEl = document.getElementById('stat-total') || document.querySelector('.kpi-total');
                const csatEl = document.getElementById('stat-csat') || document.querySelector('.kpi-csat');
                const npsEl = document.getElementById('stat-nps') || document.querySelector('.kpi-nps');

                if(totalEl) totalEl.innerText = stats.totalResponses;
                if(csatEl) csatEl.innerText = stats.avgSatisfaction;
                if(npsEl) npsEl.innerText = stats.npsScore;
            }

            // 2. Fetch Trend Chart Data
            const trendRes = await authFetch(`${API_BASE}/analytics/trends`);
            if(trendRes && trendRes.ok) {
                const trendData = await trendRes.json();
                
                // Destroy old chart if exists to prevent overlap
                const existingChart = Chart.getChart(trendCtx);
                if (existingChart) existingChart.destroy();

                new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: trendData.labels,
                        datasets: [{
                            label: 'Daily Responses',
                            data: trendData.data,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }

            // 3. Location Chart (Static/Simulated for now, or fetch if endpoint exists)
            const locCtx = document.getElementById('locationChart');
            if(locCtx) {
                new Chart(locCtx, {
                    type: 'bar',
                    data: {
                        labels: ['New York', 'London', 'Tokyo'],
                        datasets: [{
                            label: 'Satisfaction',
                            data: [4.5, 4.2, 4.8], // Replace with API data if available
                            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }

        } catch(e) { console.error("Analytics Load Error", e); }
    }

    function exportCSV() {
        // Simple CSV generation from current visible stats
        let csv = "Metric,Value\n";
        const total = document.getElementById('stat-total')?.innerText || "0";
        const csat = document.getElementById('stat-csat')?.innerText || "0";
        const nps = document.getElementById('stat-nps')?.innerText || "0";

        csv += `Total Responses,${total}\n`;
        csv += `Average CSAT,${csat}\n`;
        csv += `NPS Score,${nps}\n`;
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cfp_report.csv';
        a.click();
    }

    // ============================================================
    // 6. USER MANAGEMENT (users.html)
    // ============================================================
    const usersTable = document.getElementById('usersTable');
    if (usersTable) {
        fetchUsers();
        
        // Find the "Add New User" button
        // Note: Ensure your button in HTML has a unique class or ID if possible. 
        // Using the class selector from original code:
        const addBtn = document.querySelector("button.bg-blue-600"); 
        
        if (addBtn && addBtn.innerText.includes("Add New User")) {
            addBtn.addEventListener('click', async () => {
                const name = prompt("Enter Name:");
                if(!name) return;
                const email = prompt("Enter Email:");
                if(!email) return;
                const password = prompt("Enter Temporary Password:");
                if(!password) return;
                const role = prompt("Enter Role (Admin/Analyst):", "Analyst");

                try {
                    const res = await authFetch(`${API_BASE}/users`, {
                        method: 'POST',
                        body: JSON.stringify({ name, email, password, role })
                    });
                    
                    if(res && res.ok) {
                        alert("User added successfully");
                        fetchUsers();
                    } else {
                        alert("Failed to add user.");
                    }
                } catch(e) { alert("Error adding user"); }
            });
        }
    }

    async function fetchUsers() {
        const res = await authFetch(`${API_BASE}/users`);
        if(res && res.ok) {
            const users = await res.json();
            const tbody = usersTable.querySelector('tbody');
            tbody.innerHTML = ''; 
            
            users.forEach(user => {
                const badgeColor = user.status === 'Active' ? 'green' : 'red';
                tbody.innerHTML += `
                    <tr class="hover:bg-gray-50 border-b">
                        <td class="p-4 text-sm font-medium">${user.name}</td>
                        <td class="p-4 text-sm text-gray-500">${user.email}</td>
                        <td class="p-4"><span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">${user.role}</span></td>
                        <td class="p-4"><span class="px-2 py-1 text-xs rounded-full bg-${badgeColor}-100 text-${badgeColor}-800">${user.status}</span></td>
                        <td class="p-4 text-sm text-blue-600 cursor-pointer">Edit</td>
                    </tr>`;
            });
        }
    }
});