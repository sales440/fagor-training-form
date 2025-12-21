import { getActiveNotificationEmails } from './server/db';

async function main() {
  try {
    const emails = await getActiveNotificationEmails();
    
    console.log('\n📧 EMAILS CONFIGURADOS PARA NOTIFICACIONES:\n');
    console.log('='.repeat(60));
    
    if (emails.length === 0) {
      console.log('❌ NO HAY EMAILS CONFIGURADOS');
    } else {
      emails.forEach((email, index) => {
        console.log(`\n${index + 1}. Email: ${email.email}`);
        console.log(`   ID: ${email.id}`);
        console.log(`   Activo: ${email.isActive ? 'Sí' : 'No'}`);
        console.log(`   Fecha de creación: ${email.createdAt}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`\nTotal: ${emails.length} email(s) activo(s)\n`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
