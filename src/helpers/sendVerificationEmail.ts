import {resend} from '@/lib/resend';
// import {VerificationEmail} from '@/emails/VerificationEmail';
import { ApiResponse } from '../../types/ApiResponse';
import VerificationEmail from '../../emails/VerificationEmail';

export const sendVerificationEmail = async (email: string,
    username: string, 
     verificationCode: string
    ): Promise<ApiResponse> => {
        try {
            await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: email,
  subject: 'Echo-box Verification Code',
  react: VerificationEmail({username, otp:verificationCode}),
});
​            return {success: true, message: "Verification email sent successfully"};
        } catch (emailError) {
            console.error("Error sending verification Email", emailError);
            return {success: false, message: "Error sending verification email"};
        }
    }