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
        return; 
    }

    // --- Helper: Authenticated Fetch ---
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

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_role');
            window.location.href = 'login.html';
        });
    }

    // Populate Sidebar User Info
    const userNameEl = document.getElementById('sidebar-user-name');
    if(userNameEl) userNameEl.innerText = localStorage.getItem('user_name') || 'Admin';

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
                const res = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ email, password })
                });
                
                if(res.ok) {
                    const data = await res.json();
                    localStorage.setItem('jwt_token', data.token);
                    localStorage.setItem('user_role', data.user.role || 'Analyst');
                    localStorage.setItem('user_name', data.user.name || 'User');
                    window.location.href = 'index.html';
                } else {
                    if(errorMsg) {
                        errorMsg.innerText = "Invalid email or password";
                        errorMsg.classList.remove('hidden');
                    } else {
                        alert('Invalid Credentials');
                    }
                }
            } catch(e) { console.error(e); alert('Server Connection Error'); }
        });
    }

    // ============================================================
    // 4. SURVEY BUILDER (Optimized Questions)
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

        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('bg-blue-50', 'border-blue-300'); });
        dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('bg-blue-50', 'border-blue-300'); });
        
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

        // --- OPTIMIZED QUESTION UI GENERATION ---
        
        // 1. NPS (Net Promoter Score)
        if (type === 'nps') {
            label = "How likely are you to recommend us?";
            html = `
            <div class="bg-white border border-gray-200 p-5 mb-4 rounded-lg shadow-sm hover:shadow-md transition group" id="q-${id}">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center">
                        <span class="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide mr-2">NPS</span>
                        <input class="font-medium text-gray-800 text-lg border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-96 transition" value="${label}" onchange="updQ(${id}, this.value)">
                    </div>
                    <button onclick="delQ(${id})" class="text-gray-400 hover:text-red-500 transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
                <div class="flex justify-between mt-4 px-2">
                    ${Array.from({length: 11}, (_, i) => `<div class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-xs text-gray-500 bg-gray-50">${i}</div>`).join('')}
                </div>
                <div class="flex justify-between text-xs text-gray-400 mt-2 px-1">
                    <span>Not Likely</span>
                    <span>Very Likely</span>
                </div>
            </div>`;
        } 
        
        // 2. CSAT (Customer Satisfaction)
        else if (type === 'csat') {
            label = "How satisfied are you with our service?";
            html = `
            <div class="bg-white border border-gray-200 p-5 mb-4 rounded-lg shadow-sm hover:shadow-md transition group" id="q-${id}">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center">
                        <span class="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide mr-2">CSAT</span>
                        <input class="font-medium text-gray-800 text-lg border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-96 transition" value="${label}" onchange="updQ(${id}, this.value)">
                    </div>
                    <button onclick="delQ(${id})" class="text-gray-400 hover:text-red-500 transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
                <div class="flex space-x-2 mt-2">
                    ${Array.from({length: 5}, () => `<svg class="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`).join('')}
                </div>
            </div>`;
        } 
        
        // 3. Text (Comments)
        else if (type === 'text') {
            label = "Do you have any additional feedback?";
            html = `
            <div class="bg-white border border-gray-200 p-5 mb-4 rounded-lg shadow-sm hover:shadow-md transition group" id="q-${id}">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center">
                        <span class="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide mr-2">Text</span>
                        <input class="font-medium text-gray-800 text-lg border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-96 transition" value="${label}" onchange="updQ(${id}, this.value)">
                    </div>
                    <button onclick="delQ(${id})" class="text-gray-400 hover:text-red-500 transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
                <textarea disabled class="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm h-20 resize-none" placeholder="User answer will go here..."></textarea>
            </div>`;
        } 
        
        // 4. Multiple Choice (Optimized: Editable Options)
        else if (type === 'multi') {
            label = "Which feature do you value most?";
            html = `
            <div class="bg-white border border-gray-200 p-5 mb-4 rounded-lg shadow-sm hover:shadow-md transition group" id="q-${id}">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center">
                        <span class="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide mr-2">Multi</span>
                        <input class="font-medium text-gray-800 text-lg border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-96 transition" value="${label}" onchange="updQ(${id}, this.value)">
                    </div>
                    <button onclick="delQ(${id})" class="text-gray-400 hover:text-red-500 transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
                <div class="space-y-2 pl-1" id="opts-${id}">
                    <div class="flex items-center">
                        <input type="radio" disabled class="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300">
                        <input class="text-sm text-gray-700 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full py-1" placeholder="Option 1">
                    </div>
                    <div class="flex items-center">
                        <input type="radio" disabled class="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300">
                        <input class="text-sm text-gray-700 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full py-1" placeholder="Option 2">
                    </div>
                </div>
                <button onclick="addOpt(${id})" class="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                    <span class="text-lg mr-1">+</span> Add another option
                </button>
            </div>`;
        }

        dropZone.insertAdjacentHTML('beforeend', html);
        questions.push({ id, type, label });
    }

    // --- Global Helpers for Dynamic HTML ---
    window.delQ = (id) => { 
        document.getElementById(`q-${id}`).remove(); 
        questions = questions.filter(q => q.id !== id);
        if(questions.length === 0) {
            const dropZone = document.getElementById('drop-zone');
            dropZone.innerHTML = '<p id="empty-msg" class="text-center text-gray-400 text-sm mt-32 italic">Drag questions from the left panel and drop them here.</p>';
        }
    };
    window.updQ = (id, val) => { 
        const q = questions.find(q => q.id === id);
        if(q) q.label = val; 
    };
    window.addOpt = (id) => {
        const container = document.getElementById(`opts-${id}`);
        const count = container.children.length + 1;
        const html = `
            <div class="flex items-center">
                <input type="radio" disabled class="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300">
                <input class="text-sm text-gray-700 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full py-1" placeholder="Option ${count}">
            </div>`;
        container.insertAdjacentHTML('beforeend', html);
    };

    // --- QR Code Logic ---
    if(window.location.pathname.includes('surveys.html')) {
        const qrContainer = document.querySelector('.w-24.h-24.bg-gray-200'); // Targeted selector
        const linkText = document.getElementById('survey-link');
        
        if(qrContainer && linkText) {
            // Point to the live survey page on the current host
            const takeSurveyUrl = `${window.location.origin}/take_survey.html`; // Dynamic Host
            
            // Generate QR
            qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(takeSurveyUrl)}" alt="QR Code" class="w-full h-full object-cover">`;
            qrContainer.classList.remove('bg-gray-200'); // Remove gray bg once loaded
            
            // Update Link
            linkText.href = takeSurveyUrl;
            linkText.innerText = "Link to Live Survey";
        }
    }

    // --- Publish Survey ---
    if(publishBtn) {
        publishBtn.addEventListener('click', async () => {
            if (questions.length === 0) return alert("Please add at least one question.");
            const titleInput = document.getElementById('survey-title-input');
            const title = titleInput ? titleInput.value : "Untitled Survey";
            
            try {
                const res = await authFetch(`${API_BASE}/surveys`, {
                    method: 'POST',
                    body: JSON.stringify({ title, isPublished: true, questionsJson: JSON.stringify(questions) })
                });
                
                if(res && res.ok) {
                    alert('✅ Survey Published Successfully!');
                    questions = [];
                    dropZone.innerHTML = '<p id="empty-msg" class="text-center text-gray-400 text-sm mt-32 italic">Drag questions from the left panel and drop them here.</p>';
                } else {
                    alert('❌ Error publishing survey.');
                }
            } catch(e) { console.error(e); }
        });
    }

    // ============================================================
    // 5. ANALYTICS & DASHBOARD (analytics.html / index.html)
    // ============================================================
    const trendCtx = document.getElementById('trendChart');
    const filterBtn = document.getElementById('apply-filters');
    const exportBtn = document.getElementById('export-btn');

    if (trendCtx) {
        loadAnalytics();

        if(filterBtn) {
            filterBtn.addEventListener('click', () => {
                const loc = document.querySelector('select')?.value || ''; 
                loadAnalytics(loc);
            });
        }

        if(exportBtn) {
            exportBtn.addEventListener('click', exportCSV);
        }
    }

    // FIX: FETCH DASHBOARD STATS (Total, NPS, CSAT)
    const statTotal = document.getElementById('stat-total');
    if (statTotal) {
        // Fetch separate stats for the cards
        fetch(`${API_BASE}/analytics/dashboard-stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('stat-total').innerText = data.totalResponses || 0;
            document.getElementById('stat-csat').innerText = data.avgSatisfaction || 0;
            document.getElementById('stat-nps').innerText = data.npsScore || 0;
        })
        .catch(err => console.log("Stats fetch error (likely empty DB or auth)", err));
    }

    async function loadAnalytics(location = '') {
        try {
            // Fetch Trend Chart Data
            const trendRes = await authFetch(`${API_BASE}/analytics/trends`);
            if(trendRes && trendRes.ok) {
                const trendData = await trendRes.json();
                
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
        } catch(e) { console.error("Analytics Load Error", e); }
    }

    function exportCSV() {
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
            if(!tbody) return;
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