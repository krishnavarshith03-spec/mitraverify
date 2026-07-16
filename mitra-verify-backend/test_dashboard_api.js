const axios = require('axios');

async function test() {
    const api = axios.create({
        baseURL: 'http://127.0.0.1:8000/api/v1'
    });
    // Let's assume we log in to get a token.
    try {
        const loginRes = await api.post('/auth/login', {
            email: 'test@example.com',
            password: 'password123'
        });
        const token = loginRes.data.access_token;
        console.log("Logged in. Token:", token.substring(0, 20) + "...");

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const overviewRes = await api.get('/analytics/overview');
        console.log("Overview status:", overviewRes.status);
        console.log("Overview data:", overviewRes.data);

        const eventsRes = await api.get('/analytics/events?limit=100');
        console.log("Events status:", eventsRes.status);
        console.log("Events returned:", eventsRes.data.length);
        if (eventsRes.data.length > 0) {
            console.log("First event:", eventsRes.data[0]);
        }

    } catch(err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}
test();
