const nodemailer = require('nodemailer');

// // Create a transporter object using Gmail
// const transporter = nodemailer.createTransport({
//   host: 'smtp.ethereal.email',
//   port: 587, // TLS port
//   secure: false, // true for port 465
//   auth: {
//     user: 'karthikeyan971108@gmail.com',
//     pass: 'Passisgmail@123', // Your app password
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// // Function to send email
// const sendEmail = async (to, subject, text) => {
//   const mailOptions = {
//     from: 'karthikeyan971108@gmail.com',
//     to, // Recipient's email address
//     subject, // Subject line
//     text, // Email body
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent: ' + info.response);
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };

// // Usage
// sendEmail('m.karthikeyan@casagrand.co.in', 'Test Subject', 'Hello from Node.js!');

// node sendEmail.js karthikeyan971107@gmail.com "Test Subject" "Hello from Node.js!"

// const nodemailer = require('nodemailer');

// // Create a transporter object using Gmail
// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587, // Use port 587 for TLS
//   secure: false, // Set to true for port 465
//   auth: {
//     user: 'karthikeyan971108@gmail.com', // Your email
//     pass: 'iklv fnxm gvqs oaeu', // Your app password or email password
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// // Function to send email
// const sendEmail = async (to, subject, text) => {
//   const mailOptions = {
//     from: 'karthikeyan971108@gmail.com',
//     to, // Recipient's email address
//     subject, // Subject line
//     text, // Email body
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent: ' + info.response);
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };

// // Usage
// sendEmail('m.karthikeyan@casagrand.co.in', 'Test Subject', 'Hello from Node.js!');

// Create a transporter object using Gmail
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Set to true for port 465
    auth: {
        user: 'info@digilogy.co', // Your email
        pass: 'rfvb asoo wswt ocgd', // Your app password or email password
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// Function to send email
const sendEmail = async (to, subject, text, options = {}) => {
    // const mailOptions = {
    //     from: 'info@digilogy.co', // Sender's email
    //     to, // Recipient's email
    //     subject, // Subject line
    //     text, // Email body
    // };

     const mailOptions = {
        from: 'info@digilogy.co',
        to: to,
        subject: subject,
        text: options.html ? undefined : text, // Send plain text if not HTML
        html: options.html ? text : undefined // Send HTML if specified
    };


    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Export the sendEmail function
module.exports = sendEmail;
