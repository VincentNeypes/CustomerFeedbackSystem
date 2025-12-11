document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://localhost:5075/api'; // Check your port!

    // ============================================
    // 1. GLOBAL: Sidebar & Mobile Menu
    // ============================================
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

    // ============================================
    // 2. SURVEY BUILDER LOGIC
    // ============================================
    const dropZone = document.getElementById('drop-zone');
    const publishBtn = document.getElementById('publish-btn');
    let questions = [];

    if (dropZone) {
        // Drag Start
        document.querySelectorAll('.draggable-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('type', e.target.getAttribute('data-type'));
            });
        });

        // Drag Over
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('bg-blue-50', 'border-blue-300');
        });

        // Drag Leave
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('bg-blue-50', 'border-blue-300');
        });

        // Drop
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-blue-50', 'border-blue-300');
            const type = e.dataTransfer.getData('type');
            if(type) addQuestion(type);
        });
    }

    function addQuestion(type) {
        const placeholder = document.getElementById('empty-msg');
        if (placeholder) placeholder.remove();

        const id = Date.now();
        let html = '';
        let label = '';
        
        // --- 1. NPS ---
        if (type === 'nps') {
            label = "How likely are you to recommend us?";
            html = `
            <div class="bg-white border border-gray-200 p-4 mb-4 rounded-lg shadow-sm group" id="q-${id}">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-bold text-blue-600">🔢 NPS (0-10 Slider)</span>
                    <span class="text-xs text-gray-400 cursor-move">:: Drag</span>
                </div>
                <textarea class="w-full p-2 border border-gray-300 rounded text-sm mb-3 focus:outline-none focus:border-blue-500" rows="2" onchange="updateLabel(${id}, this.value)">${label}</textarea>
                <div class="flex justify-between items-center pt-2 border-t border-gray-50">
                    <label class="inline-flex items-center text-xs text-gray-600"><input type="checkbox" class="form-checkbox text-blue-600 rounded mr-2" checked> Required</label>
                    <button onclick="deleteQuestion(${id})" class="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                </div>
            </div>`;
        } 
        // --- 2. CSAT ---
        else if (type === 'csat') {
            label = "How satisfied are you with our service?";
            html = `
            <div class="bg-white border border-gray-200 p-4 mb-4 rounded-lg shadow-sm group" id="q-${id}">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-bold text-yellow-600">⭐ CSAT (1-5 Star)</span>
                    <span class="text-xs text-gray-400 cursor-move">:: Drag</span>
                </div>
                <textarea class="w-full p-2 border border-gray-300 rounded text-sm mb-3 focus:outline-none focus:border-blue-500" rows="2" onchange="updateLabel(${id}, this.value)">${label}</textarea>
                <div class="flex justify-between items-center pt-2 border-t border-gray-50">
                    <label class="inline-flex items-center text-xs text-gray-600"><input type="checkbox" class="form-checkbox text-blue-600 rounded mr-2" checked> Required</label>
                    <button onclick="deleteQuestion(${id})" class="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                </div>
            </div>`;
        } 
        // --- 3. Text Area ---
        else if (type === 'text') {
            label = "Please share any additional comments.";
            html = `
            <div class="bg-white border border-gray-200 p-4 mb-4 rounded-lg shadow-sm group" id="q-${id}">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-bold text-gray-600">📝 Text Area</span>
                    <span class="text-xs text-gray-400 cursor-move">:: Drag</span>
                </div>
                <textarea class="w-full p-2 border border-gray-300 rounded text-sm mb-3 focus:outline-none focus:border-blue-500" rows="2" onchange="updateLabel(${id}, this.value)">${label}</textarea>
                <div class="flex justify-between items-center pt-2 border-t border-gray-50">
                    <label class="inline-flex items-center text-xs text-gray-600"><input type="checkbox" class="form-checkbox text-blue-600 rounded mr-2"> Optional</label>
                    <button onclick="deleteQuestion(${id})" class="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                </div>
            </div>`;
        }
        // --- 4. Multiple Choice ---
        else if (type === 'multi') {
            label = "Which of the following describes you?";
            html = `
            <div class="bg-white border border-gray-200 p-4 mb-4 rounded-lg shadow-sm group" id="q-${id}">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-bold text-green-600">✅ Multiple Choice</span>
                    <span class="text-xs text-gray-400 cursor-move">:: Drag</span>
                </div>
                <textarea class="w-full p-2 border border-gray-300 rounded text-sm mb-3 focus:outline-none focus:border-blue-500" rows="2" onchange="updateLabel(${id}, this.value)">${label}</textarea>
                <div class="space-y-2 mb-3 pl-2 border-l-2 border-gray-100">
                    <div class="flex items-center"><input type="radio" disabled class="mr-2"><input class="text-xs border-b border-gray-300 w-full focus:outline-none py-1" value="Option 1"></div>
                    <div class="flex items-center"><input type="radio" disabled class="mr-2"><input class="text-xs border-b border-gray-300 w-full focus:outline-none py-1" value="Option 2"></div>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-gray-50">
                    <label class="inline-flex items-center text-xs text-gray-600"><input type="checkbox" class="form-checkbox text-blue-600 rounded mr-2" checked> Required</label>
                    <button onclick="deleteQuestion(${id})" class="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                </div>
            </div>`;
        }

        dropZone.insertAdjacentHTML('beforeend', html);
        questions.push({ id, type, label });
    }

    // --- Helper Functions (Global Scope) ---
    window.deleteQuestion = (id) => {
        const el = document.getElementById(`q-${id}`);
        if(el) el.remove();
        questions = questions.filter(q => q.id !== id);
    }

    window.updateLabel = (id, val) => {
        const q = questions.find(q => q.id === id);
        if(q) q.label = val;
    }

    // --- Publish Logic ---
    if(publishBtn) {
        publishBtn.addEventListener('click', async () => {
            const titleInput = document.getElementById('survey-title-input');
            const title = titleInput ? titleInput.value : "Untitled Survey";
            
            if (questions.length === 0) return alert("Please add at least one question.");

            const payload = {
                title: title,
                description: "Published via Admin Panel",
                isPublished: true,
                questionsJson: JSON.stringify(questions)
            };

            try {
                // FIXED ENDPOINT: Sent to /api/surveys (not /api/users)
                const res = await fetch(`${API_BASE}/surveys`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                });
                
                if(res.ok) {
                    alert('✅ Survey Published Successfully!');
                    questions = [];
                    dropZone.innerHTML = '<p id="empty-msg" class="text-center text-gray-400 text-sm mt-32 italic">Drag questions from the left panel and drop them here.</p>';
                } else {
                    alert('❌ Error publishing survey');
                }
            } catch(e) {
                console.error(e);
                alert('❌ Backend not reachable. Is the port correct?');
            }
        });
    }

    // ============================================
    // 3. ANALYTICS PAGE LOGIC
    // ============================================
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
        // Fetch real data logic can go here. Using mock for visual display.
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Avg Score',
                    data: [3.5, 3.8, 4.0, 4.2, 4.1, 4.5],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        new Chart(document.getElementById('locationChart'), {
            type: 'bar',
            data: {
                labels: ['New York', 'London', 'Tokyo', 'Berlin'],
                datasets: [{
                    label: 'Satisfaction',
                    data: [85, 72, 90, 65],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // ============================================
    // 4. USERS PAGE LOGIC (Fetch & Add)
    // ============================================
    const usersTable = document.getElementById('usersTable');
    const addUserBtn = document.querySelector("button.bg-blue-600"); // "+ Add User" button

    if (usersTable) {
        fetchUsers();

        // Add User Logic
        if (addUserBtn && addUserBtn.innerText.includes("Add New User")) {
            addUserBtn.addEventListener('click', async () => {
                const name = prompt("Enter Name:");
                const email = prompt("Enter Email:");
                if (!name || !email) return;

                try {
                    await fetch(`${API_BASE}/users`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, role: "Analyst", status: "Active", passwordHash: "123" })
                    });
                    fetchUsers(); // Refresh table
                } catch(e) { console.error(e); alert("Failed to add user"); }
            });
        }
    }

    async function fetchUsers() {
        try {
            const res = await fetch(`${API_BASE}/users`);
            const users = await res.json();
            const tbody = usersTable.querySelector('tbody');
            tbody.innerHTML = ''; 

            users.forEach(user => {
                const badgeColor = user.status === 'Active' ? 'green' : 'red';
                const row = `
                    <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                        <td class="p-4 text-sm font-medium text-gray-900">${user.name}</td>
                        <td class="p-4 text-sm text-gray-500">${user.email}</td>
                        <td class="p-4"><span class="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">${user.role}</span></td>
                        <td class="p-4"><span class="px-3 py-1 text-xs font-medium rounded-full bg-${badgeColor}-100 text-${badgeColor}-800">${user.status}</span></td>
                        <td class="p-4 text-sm"><a href="#" class="text-blue-600 hover:underline mr-3 font-medium">Edit</a></td>
                    </tr>`;
                tbody.innerHTML += row;
            });
        } catch (e) { console.error(e); }
    }
});