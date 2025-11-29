const axios = require('axios');

async function main() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/auth/login', {
            email: 'testdoc@test.local',
            password: 'Admin123'
        });

        const { token, tenant } = loginRes.data;
        console.log('Login successful!');
        console.log('Token:', token.substring(0, 20) + '...');
        console.log('Tenant Slug:', tenant.slug);

        // 2. Add Medicine
        console.log('\nAdding Medicine...');
        const medicineData = {
            name: 'Test API Med ' + Date.now(),
            manufacturer: 'Test Pharma',
            unit: 'Tablet',
            lowStockThreshold: 10
        };

        const medRes = await axios.post('http://localhost:3000/pharmacy/medicines', medicineData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-tenant-slug': tenant.slug
            }
        });

        console.log('Medicine added successfully!');
        console.log(medRes.data);

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

main();
