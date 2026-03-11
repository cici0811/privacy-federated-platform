const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
// Use a token that would be valid. Since we don't have login in this script, 
// we assume the backend might skip auth for testing or we use the mock token if backend doesn't strictly check signature for 'mock-token' string (which it usually doesn't in dev if not configured).
// However, the backend auth middleware checks `jwt.verify(token, JWT_SECRET)`.
// So we need to login first to get a real token.

async function runTest() {
  try {
    console.log('--- Starting Integration Test ---');

    // 1. Login to get token
    console.log('\n[1] Testing Login...');
    let token;
    try {
      const loginRes = await axios.post(`${BASE_URL}/login`, {
        username: 'admin',
        password: '123456'
      });
      token = loginRes.data.token;
      console.log('✅ Login Successful. Token obtained.');
    } catch (e) {
      console.error('❌ Login Failed:', e.message);
      if (e.response) console.error(e.response.data);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Test Scheduler API
    console.log('\n[2] Testing Scheduler API (Initiate Meeting)...');
    let meetingId;
    try {
      const initRes = await axios.post(`${BASE_URL}/scheduler/initiate`, {
        topic: 'Integration Test Meeting',
        duration: '60 min',
        participants: ['user1', 'user2'],
        dateRange: '2023-10-23'
      }, { headers });
      
      if (initRes.data.success && initRes.data.meetingId) {
        meetingId = initRes.data.meetingId;
        console.log(`✅ Meeting Initiated. ID: ${meetingId}`);
      } else {
        throw new Error('Initiate failed response');
      }
    } catch (e) {
      console.error('❌ Scheduler Initiate Failed:', e.message);
      if (e.response) console.error(e.response.data);
    }

    if (meetingId) {
      console.log('\n[3] Testing Scheduler Status Polling...');
      // Poll a few times
      for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const statusRes = await axios.get(`${BASE_URL}/scheduler/status/${meetingId}`, { headers });
        console.log(`   Status: ${statusRes.data.status}, Progress: ${statusRes.data.progress}%`);
        if (statusRes.data.status === 'ready') break;
      }
    }

    // 3. Test Travel API
    console.log('\n[4] Testing Travel API (Search)...');
    let searchId;
    try {
      const searchRes = await axios.post(`${BASE_URL}/travel/search`, {
        destination: 'Shanghai',
        dateRange: '2023-12-01',
        companions: ['Alice']
      }, { headers });

      if (searchRes.data.success && searchRes.data.searchId) {
        searchId = searchRes.data.searchId;
        console.log(`✅ Travel Search Initiated. ID: ${searchId}`);
      } else {
        throw new Error('Search failed response');
      }
    } catch (e) {
      console.error('❌ Travel Search Failed:', e.message);
      if (e.response) console.error(e.response.data);
    }

    if (searchId) {
       console.log('\n[5] Testing Travel Results...');
       await new Promise(r => setTimeout(r, 2000)); // Wait for simulated calculation
       try {
         const resultRes = await axios.get(`${BASE_URL}/travel/results/${searchId}`, { headers });
         if (resultRes.data.success && resultRes.data.results.length > 0) {
           console.log(`✅ Travel Results Retrieved. Count: ${resultRes.data.results.length}`);
           console.log('   Sample:', resultRes.data.results[0].transport);
         } else {
           console.log('⚠️ No results found or pending.');
         }
       } catch (e) {
         console.error('❌ Get Travel Results Failed:', e.message);
       }
    }

    // 4. Test Audit Logs
    console.log('\n[6] Testing Audit Logs...');
    try {
      const logsRes = await axios.get(`${BASE_URL}/dashboard/audit-logs`, { headers });
      if (logsRes.data.success) {
        console.log(`✅ Audit Logs Retrieved. Count: ${logsRes.data.logs.length}`);
        const latestLog = logsRes.data.logs[0];
        console.log(`   Latest Log Event: ${latestLog.event} (${latestLog.type})`);
      }
    } catch (e) {
      console.error('❌ Get Audit Logs Failed:', e.message);
    }

    console.log('\n--- Test Completed ---');

  } catch (err) {
    console.error('Unexpected Error:', err);
  }
}

runTest();
