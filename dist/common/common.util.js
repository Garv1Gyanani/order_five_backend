"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require('nodemailer');
const CommonService = {
    getPagination: (page, size) => {
        const limit = size ? +size : 10;
        const offset = page > 1 ? (page - 1) * limit : 0;
        return { limit, offset };
    },
    getPagingData: (alldata, page, limit) => {
        const { count: totalItems, rows: data } = alldata;
        const currentPage = page ? +page : 1;
        const totalPages = Math.ceil(totalItems / limit);
        return { totalItems, data, totalPages, currentPage };
    },
    generateOTP: () => {
        return 123456;
    },
    sendOTP: (phone_num, otp) => {
    },
    createTransactionId: () => {
        const timestamp = Date.now().toString();
        const randomNum = Math.floor(Math.random() * 1e6).toString().padStart(6, '0');
        return `tnx_${timestamp}${randomNum}`;
    },
    sendEmail: async (to, variables, template, smtpSettings) => {
        try {
            if (!smtpSettings || !template) {
                return;
            }
            let smtp_pass = smtpSettings.find((o) => o.key == 'smtp_pass').value;
            let smtp_username = smtpSettings.find((o) => o.key == 'smtp_username').value;
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: smtp_username,
                    pass: smtp_pass,
                },
            });
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
        }
        catch (error) {
            console.log("Failed to send email:", error);
        }
    },
};
exports.default = CommonService;
//# sourceMappingURL=common.util.js.map