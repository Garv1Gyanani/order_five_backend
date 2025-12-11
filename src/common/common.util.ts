const nodemailer = require('nodemailer');

const CommonService = {
    getPagination: (page: number, size: number) => {
        const limit = size ? +size : 10;
        const offset = page > 1 ? (page - 1) * limit : 0;
        return { limit, offset };
    },

    getPagingData: (alldata: { count: number, rows: any[] }, page: number, limit: number) => {
        const { count: totalItems, rows: data } = alldata;
        const currentPage = page ? +page : 1;
        const totalPages = Math.ceil(totalItems / limit);
        return { totalItems, data, totalPages, currentPage };
    },

    generateOTP: () => {
        return 123456;
        // return Math.floor(100000 + Math.random() * 900000).toString();
    },
    sendOTP: (phone_num: any, otp: any) => {
        // const transporter = nodemailer.createTransport({
        //   service: 'gmail',
        //   auth: {
        //     user: 'your-email@gmail.com',
        //     pass: 'your-email-password',
        //   },
        // });

        // const mailOptions = {
        //   from: 'your-email@gmail.com',
        //   to: phone_num + '@example.com', // Use SMS API for actual phone numbers
        //   subject: 'Your OTP code',
        //   text: `Your OTP code is: ${otp}`,
        // };

        // await transporter.sendMail(mailOptions);
    },
    createTransactionId: () => {
        const timestamp = Date.now().toString();
        const randomNum = Math.floor(Math.random() * 1e6).toString().padStart(6, '0');
        return `tnx_${timestamp}${randomNum}`;
    },
    sendEmail: async (to: string, variables: Record<string, string>, template: any, smtpSettings: any) => {
        try {
            if (!smtpSettings || !template) {
                return;
            }
            let smtp_pass = smtpSettings.find((o) => o.key == 'smtp_pass').value
            let smtp_username = smtpSettings.find((o) => o.key == 'smtp_username').value

            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: smtp_username,
                    pass: smtp_pass,
                },
            });

            // Replace variables in the template
            let emailContent = template.value;
            let subject = template.subject;
            for (const [key, value] of Object.entries(variables)) {
                emailContent = emailContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
            }

            const mailOptions = {
                from: smtp_username,
                to,
                subject,
                html: emailContent,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${to}`);
        } catch (error) {
            console.log("Failed to send email:", error);
        }
    },
    
};

export default CommonService;
