const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;

const app = express();

// Storage setup using Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    }
});

app.get('/test', (req, res) => {
    return res.json({ test: 'hello world'});
});

// POST endpoint to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    const uploadedFile = req.file;
    const filePath = uploadedFile.path;
  
    const mailOptions = {
      from: 'your_email@gmail.com',
      to: 'recipient_email@example.com',
      subject: 'File Uploaded',
      text: `Your file (${uploadedFile.originalname}) has been uploaded successfully.`,
      attachments: [
        {
          filename: uploadedFile.originalname,
          content: fs.createReadStream(filePath), // Stream file content
        },
      ],
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error occurred while sending email:', error);
        return res.status(500).json({ error: 'Failed to send email notification' });
      }
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'File uploaded successfully and notification sent' });
    });
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
