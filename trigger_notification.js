const axios = require('axios');

async function triggerTest() {
    const API_URL = 'http://localhost:5000/api/v1';

    try {
        console.log('--- Triggering Real-time Notification Test ---');

        // 1. Login as Recruiter
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'recruiter@example.com',
            password: 'password123',
            role: 'RECRUITER'
        });

        const token = loginRes.data.token;
        console.log('Logged in as Recruiter. Token acquired.');

        // 2. Post a Job (This triggers a broadcast to all students)
        const jobData = {
            title: "Super Sync Developer",
            description: "Testing real-time notification synchronization across multiple tabs.",
            location: "Remote",
            package_lpa: 25,
            min_cgpa: 8.5,
            eligible_branch: "CSE, IT",
            deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            graduation_year: 2025,
            requirements: ["React", "Socket.io", "Service Workers"]
        };

        const jobRes = await axios.post(`${API_URL}/jobs`, jobData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Success: Job posted! Broadcast event should have fired.');
        console.log('Job ID:', jobRes.data.data._id);

    } catch (err) {
        console.error('Error during trigger:', err.response?.data || err.message);
    }
}

triggerTest();
