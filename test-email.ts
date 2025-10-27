import { sendTrainingRequestEmail } from './server/emailService';

async function testEmail() {
  console.log('Sending test email...');
  
  const result = await sendTrainingRequestEmail({
    companyName: "Test Company Inc.",
    contactPerson: "John Doe",
    email: "john.doe@testcompany.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, Chicago, IL 60601",
    machineBrand: "DMG MORI",
    machineModel: "NLX 2500",
    controllerModel: "8065",
    machineType: "Lathe",
    programmingType: "G-Code",
    trainingDays: 3,
    knowledgeLevel: "Intermediate",
    totalPrice: 4850,
    oemName: "Test OEM",
    oemContact: "Jane Smith",
    oemEmail: "jane@testoem.com",
  });
  
  if (result) {
    console.log('✅ Test email sent successfully!');
  } else {
    console.log('❌ Failed to send test email');
  }
}

testEmail().catch(console.error);
