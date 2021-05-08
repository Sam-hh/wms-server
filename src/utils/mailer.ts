import nodemailer from 'nodemailer';
async function sendMail(reciever: string, type: string, message: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'apikey', // generated ethereal user
      pass:
        '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', // generated ethereal password
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"WMS Admin 👻" <wms.capstone21@gmail.com>', // sender address
    to: reciever, // list of receivers
    subject: type, // Subject line
    html: message, // html body
  });

  console.log('Message sent: %s', info.messageId);
}

export { sendMail };
