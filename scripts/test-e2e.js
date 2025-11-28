const crypto = require('crypto');

const BASE_URL = 'http://localhost:3000';
const SUFFIX = crypto.randomBytes(4).toString('hex');

const TENANT_DATA = {
    name: `Test Hospital ${SUFFIX}`,
    slug: `hospital_${SUFFIX}`,
    address: '123 Rural Road, India',
    adminEmail: `admin_${SUFFIX}@test.com`,
    adminPassword: 'password123',
    adminName: 'Dr. Admin'
};

const PATIENT_DATA = {
    firstName: 'Ramesh',
    lastName: 'Kumar',
    dateOfBirth: '1980-01-01',
    gender: 'MALE',
    phone: '9876543210',
    address: 'Village A',
    abhaId: `91-${crypto.randomBytes(4).toString('hex')}` // Mock ABHA ID
};

async function request(endpoint, method = 'GET', body = null, token = null, headers = {}) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        console.error(`Error calling ${endpoint}:`, error.message);
        return { status: 500, data: null };
    }
}

async function runTest() {
    console.log('Starting E2E Test...');
    console.log('Target URL:', BASE_URL);

    // 1. Register Tenant
    console.log('\n1. Registering Tenant...');
    const tenantRes = await request('/tenants', 'POST', TENANT_DATA);
    console.log('Status:', tenantRes.status);
    if (tenantRes.status !== 201) {
        console.error('Failed to register tenant:', tenantRes.data);
        return;
    }
    console.log('Tenant Registered:', tenantRes.data.tenant.name);

    // 2. Login as Admin
    console.log('\n2. Logging in as Admin...');
    const loginRes = await request('/auth/login', 'POST', {
        email: TENANT_DATA.adminEmail,
        password: TENANT_DATA.adminPassword
    });
    console.log('Status:', loginRes.status);
    if (loginRes.status !== 200) {
        console.error('Login failed:', loginRes.data);
        return;
    }
    const token = loginRes.data.token;
    console.log('Login Successful. Token received.');

    // 3. Register Patient
    console.log('\n3. Registering Patient...');
    const patientRes = await request('/patients', 'POST', PATIENT_DATA, token, {
        'x-tenant-slug': TENANT_DATA.slug
    });
    console.log('Status:', patientRes.status);
    if (patientRes.status !== 201) {
        console.error('Patient registration failed:', patientRes.data);
        return;
    }
    const patientId = patientRes.data.id;
    console.log('Patient Registered. ID:', patientId);

    // 4. Record Vitals
    console.log('\n4. Recording Vitals...');
    const vitalsRes = await request(`/patients/${patientId}/vitals`, 'POST', {
        temperature: 98.6,
        bloodPressure: '120/80',
        pulse: 72,
        weight: 70,
        height: 170,
        bloodSugar: 110 // Random Blood Sugar
    }, token, {
        'x-tenant-slug': TENANT_DATA.slug
    });
    console.log('Status:', vitalsRes.status);
    if (vitalsRes.status !== 201) {
        console.error('Vitals recording failed:', vitalsRes.data);
    } else {
        console.log('Vitals Recorded.');
    }

    // 5. Book Consultation
    console.log('\n5. Booking Consultation...');
    const consultRes = await request('/consultations', 'POST', {
        patientId: patientId,
        doctorId: loginRes.data.user.id
    }, token, {
        'x-tenant-slug': TENANT_DATA.slug
    });
    console.log('Status:', consultRes.status);
    if (consultRes.status !== 201) {
        console.error('Consultation booking failed:', consultRes.data);
        return;
    }
    const consultationId = consultRes.data.id;
    console.log('Consultation Booked. ID:', consultationId);

    // 6. Update Diagnosis (Requires DOCTOR role)
    console.log('\n6. Updating Diagnosis (Expect 403 if not Doctor)...');
    const diagRes = await request(`/consultations/${consultationId}/diagnosis`, 'PUT', {
        diagnosis: 'Common Cold',
        prescription: 'Rest and fluids',
        status: 'COMPLETED'
    }, token, {
        'x-tenant-slug': TENANT_DATA.slug
    });
    console.log('Status:', diagRes.status);
    if (diagRes.status === 403) {
        console.log('Correctly Forbidden: Admin cannot update diagnosis (Doctor only).');
    } else if (diagRes.status === 200) {
        console.log('Diagnosis Updated.');
    } else {
        console.log('Response:', diagRes.data);
    }

    console.log('\nTest Complete.');
}

runTest();
