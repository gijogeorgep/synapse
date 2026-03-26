import 'dotenv/config';
import { sendRegistrationEmail } from './utils/emailService.js';

console.log('Sending test email...');
sendRegistrationEmail('synapseeduhub@gmail.com', 'Test Admin').then(() => {
    console.log('Test complete');
    process.exit(0);
}).catch(console.error);
