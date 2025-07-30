// start-all-services.js - Start all services for testing
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting all services for testing...\n');

// Array to store all spawned processes
const processes = [];

// Function to start a service
function startService(scriptName, description, color = '\x1b[36m') {
    console.log(`${color}📡 Starting ${description}...\x1b[0m`);
    
    const child = spawn('node', [scriptName], {
        stdio: 'pipe',
        cwd: __dirname
    });
    
    // Add prefix to output
    child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
            console.log(`${color}[${description}]\x1b[0m ${line}`);
        });
    });
    
    child.stderr.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
            console.log(`${color}[${description} ERROR]\x1b[0m ${line}`);
        });
    });
    
    child.on('close', (code) => {
        console.log(`${color}[${description}]\x1b[0m Process exited with code ${code}`);
    });
    
    processes.push({ child, description });
    return child;
}

// Start services with delays to avoid conflicts
setTimeout(() => {
    startService('test-client.js', 'Database Service', '\x1b[32m'); // Green
}, 1000);

setTimeout(() => {
    startService('example-agent.js', 'Test Agent 1', '\x1b[33m'); // Yellow
}, 2000);

setTimeout(() => {
    startService('android-client-example.js', 'Android Simulation', '\x1b[35m'); // Magenta
}, 3000);

setTimeout(() => {
    console.log('\n✅ All services started!');
    console.log('🧪 You can now run API tests:');
    console.log('   node test-api-production.js');
    console.log('\n📊 Services running:');
    console.log('   🗄️  Database Service - Logs all call data to MySQL');
    console.log('   🤖 Test Agent - Simulates a phone agent');
    console.log('   📱 Android Simulation - Simulates Android app');
    console.log('\n⚠️  Press Ctrl+C to stop all services');
}, 4000);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down all services...');
    
    processes.forEach(({ child, description }) => {
        console.log(`   Stopping ${description}...`);
        child.kill('SIGINT');
    });
    
    setTimeout(() => {
        console.log('✅ All services stopped');
        process.exit(0);
    }, 2000);
});

// Keep the main process alive
process.stdin.resume();
