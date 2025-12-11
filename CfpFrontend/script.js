document.addEventListener('DOMContentLoaded', () => {
    // IMPORTANT: Matches your running server port (5075)
    const API_BASE = 'http://localhost:5075/api'; 

    // --- Sidebar Toggle ---
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

    // ============================================================
    // REQUIREMENT 1 & 2: Survey Content & Platform Tools
    // ============================================================
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

        // Drag/Drop Events
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

        if (type === 'nps') {
            label = "How likely are you to recommend us?";
            html = `<div class="bg-white border p-4 mb-4 rounded-lg shadow-sm" id="q-${id}"><div class="flex justify-between mb-2"><span class="font-bold text-blue-600">🔢 NPS</span> <button onclick="delQ(${id})" class="text-red-500 text-xs">Delete</button></div><input class="w-full border p-2 rounded text-sm" value="${label}" onchange="updQ(${id}, this.value)"></div>`;
        } else if (type === 'csat') {
            label = "How satisfied are you?";
            html = `<div class="bg-white border p-4 mb-4 rounded-lg shadow-sm" id="q-${id}"><div class="flex justify-between mb-2"><span class="font-bold text-yellow-600">⭐ CSAT</span> <button onclick="delQ(${id})" class="text-red-500 text-xs">Delete</button></div><input class="w-full border p-2 rounded text-sm" value="${label}" onchange="updQ(${id}, this.value)"></div>`;
        } else if (type === 'text') {
            label = "Comments";
            html = `<div class="bg-white border p-4 mb-4 rounded-lg shadow-sm" id="q-${id}"><div class="flex justify-between mb-2"><span class="font-bold text-gray-600">📝 Text</span> <button onclick="delQ(${id})" class="text-red-500 text-xs">Delete</button></div><input class="w-full border p-2 rounded text-sm" value="${label}" onchange="updQ(${id}, this.value)"></div>`;
        } else if (type === 'multi') {
            label = "Select an option";
            html = `<div class="bg-white border p-4 mb-4 rounded-lg shadow-sm" id="q-${id}"><div class="flex justify-between mb-2"><span class="font-bold text-green-600">✅ Multi</span> <button onclick="delQ(${id})" class="text-red-500 text-xs">Delete</button></div><input class="w-full border p-2 rounded text-sm" value="${label}" onchange="updQ(${id}, this.value)"></div>`;
        }

        dropZone.insertAdjacentHTML('beforeend', html);
        questions.push({ id, type, label });
    }

    window.delQ = (id) => { document.getElementById(`q-${id}`).remove(); questions = questions.filter(q => q.id !== id); };
    window.updQ = (id, val) => { questions.find(q => q.id === id).label = val; };

    // REQUIREMENT 3: QR Code Generation (Visual)
    if(window.location.pathname.includes('surveys.html')) {
        const qrContainer = document.querySelector('.bg-gray-200.rounded'); 
        if(qrContainer) {
            // Point to the local take_survey.html file
            // In a real deployment, this would be the public URL
            const takeSurveyUrl = window.location.href.replace('surveys.html', 'take_survey.html');
            qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(takeSurveyUrl)}" alt="QR Code" class="w-full h-full object-cover">`;
            
            // Also update the link text below it if it exists
            const linkText = qrContainer.nextElementSibling;
            if(linkText && linkText.tagName === 'A') {
                linkText.href = takeSurveyUrl;
                linkText.innerText = "Link to Survey";
            }
        }
    }

    if(publishBtn) {
        publishBtn.addEventListener('click', async () => {
            if (questions.length === 0) return alert("Please add at least one question.");
            const titleInput = document.getElementById('survey-title-input');
            const title = titleInput ? titleInput.value : "Untitled Survey";
            
            try {
                const res = await fetch(`${API_BASE}/surveys`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ title, isPublished: true, questionsJson: JSON.stringify(questions) })
                });
                
                if(res.ok) {
                    alert('✅ Survey Published Successfully!');
                    questions = [];
                    dropZone.innerHTML = '<p id="empty-msg" class="text-center text-gray-400 text-sm mt-32 italic">Drag questions here...</p>';
                } else alert('❌ Error publishing');
            } catch(e) { console.error(e); alert('Backend Error'); }
        });
    }

    // ============================================================
    // REQUIREMENT 4: Data Analysis & Visual Dashboards
    // ============================================================
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
        fetch(`${API_BASE}/analytics/trends`)
            .then(r => r.json())
            .then(data => {
                new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: data.labels,
                        datasets: [{
                            label: 'Avg Score',
                            data: data.data,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            })
            .catch(e => console.error("Chart Error:", e));

        new Chart(document.getElementById('locationChart'), {
            type: 'bar',
            data: {
                labels: ['New York', 'London', 'Tokyo'],
                datasets: [{
                    label: 'Satisfaction',
                    data: [85, 72, 90],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // ============================================================
    // REQUIREMENT 5: Security & User Mgmt
    // ============================================================
    const usersTable = document.getElementById('usersTable');
    if (usersTable) {
        fetchUsers();
        const addBtn = document.querySelector("button.bg-blue-600");
        if (addBtn && addBtn.innerText.includes("Add New User")) {
            addBtn.addEventListener('click', async () => {
                const name = prompt("Name:");
                const email = prompt("Email:");
                if (!name || !email) return;
                try {
                    await fetch(`${API_BASE}/users`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, role: "Analyst", status: "Active", passwordHash: "123" })
                    });
                    fetchUsers();
                } catch(e) { alert("Failed to add user"); }
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
                tbody.innerHTML += `
                    <tr class="hover:bg-gray-50 border-b">
                        <td class="p-4 text-sm font-medium">${user.name}</td>
                        <td class="p-4 text-sm text-gray-500">${user.email}</td>
                        <td class="p-4"><span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">${user.role}</span></td>
                        <td class="p-4"><span class="px-2 py-1 text-xs rounded-full bg-${badgeColor}-100 text-${badgeColor}-800">${user.status}</span></td>
                        <td class="p-4 text-sm text-blue-600 cursor-pointer">Edit</td>
                    </tr>`;
            });
        } catch (e) { console.error(e); }
    }
});