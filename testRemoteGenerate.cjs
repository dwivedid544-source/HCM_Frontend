const axios = require('axios');

async function doRun() {
  try {
    // 1. Login as SuperAdmin
    const loginRes = await axios.post('https://hcm-backend-production-aa3d.up.railway.app/api/auth/login', {
      email: 'superadmin@hcm.ai',
      password: 'password'
    });
    const token = loginRes.data.token;
    console.log('Got token');

    // 2. Generate Payroll for July 2026
    const generateRes = await axios.post('https://hcm-backend-production-aa3d.up.railway.app/api/superadmin/payroll/generate',
      { generateMonth: '2026-07' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Generate result:', generateRes.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
doRun();
