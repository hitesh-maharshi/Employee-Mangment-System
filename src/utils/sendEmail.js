import nodemailer from "nodemailer";

export const sendPasswordResetEmail = async (toEmail, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,  
            pass: process.env.EMAIL_PASS,  
        },
    });

    const mailOptions = {
        from: `"Employee Management System" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Password Reset OTP",
        text: `
Hello,

You requested a password reset for your account.

Your OTP is: ${otp}

This OTP will expire in 15 minutes.

If you did not request a password reset, please ignore this email.

Thanks,
Employee Management System
            `,
        };
    await transporter.sendMail(mailOptions);
};
