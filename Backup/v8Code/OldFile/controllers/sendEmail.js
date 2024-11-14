const nodemailer = require('nodemailer');

// Create a transporter object using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'karthikeyan971108@gmail.com', // Your email
    pass: 'Passisgmail@123', // Your email password or an app password
  },
});

// Function to send email
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: 'karthikeyan971108@gmail.com',
    to, // Recipient's email address
    subject, // Subject line
    text, // Email body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Usage
sendEmail('m.karthikeyan@casagrand.co.in', 'Test Subject', 'Hello from Node.js!');
