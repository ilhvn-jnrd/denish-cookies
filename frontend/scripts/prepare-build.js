const { execSync } = require('child_process');

// On Linux / POSIX servers (like Hostinger), guarantee directory permissions before next build
if (process.platform !== 'win32') {
  try {
    execSync('chmod -R 755 src public 2>/dev/null', { stdio: 'ignore' });
  } catch (err) {
    // Ignore any permission warning so build proceeds smoothly
  }
}
