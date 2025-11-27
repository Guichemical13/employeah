import nodemailer from 'nodemailer';

// Configuração do transporter de email
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envia um email de recuperação de senha
 */
export async function sendPasswordResetEmail(
  email: string,
  code: string,
  userName?: string
) {
  const mailOptions = {
    from: `"EmploYEAH! 🎉" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Código de Recuperação de Senha - EmploYEAH!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 10px;
            padding: 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #026876 0%, #03BBAF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .code-box {
            background: white;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin: 20px 0;
          }
          .code {
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 10px;
            color: #026876;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">EmploYEAH! 🎉</div>
            <h2 style="color: #026876; margin: 10px 0;">Recuperação de Senha</h2>
          </div>
          
          <p>Olá${userName ? ` ${userName}` : ''},</p>
          
          <p>Recebemos uma solicitação para redefinir a senha da sua conta EmploYEAH!. Use o código abaixo para continuar:</p>
          
          <div class="code-box">
            <p style="margin: 0; color: #666; font-size: 14px;">SEU CÓDIGO DE VERIFICAÇÃO</p>
            <div class="code">${code}</div>
            <p style="margin: 0; color: #999; font-size: 12px;">Válido por 15 minutos</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Este código expira em 15 minutos</li>
              <li>Nunca compartilhe este código com ninguém</li>
              <li>Se você não solicitou esta redefinição, ignore este email</li>
            </ul>
          </div>
          
          <p>Se tiver alguma dúvida, entre em contato com nosso suporte.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} EmploYEAH! - Plataforma de Engajamento Gamificado</p>
            <p style="font-size: 12px; color: #999;">Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
EmploYEAH! - Recuperação de Senha

Olá${userName ? ` ${userName}` : ''},

Recebemos uma solicitação para redefinir a senha da sua conta.

SEU CÓDIGO DE VERIFICAÇÃO: ${code}

Este código expira em 15 minutos.

⚠️ Importante:
- Nunca compartilhe este código com ninguém
- Se você não solicitou esta redefinição, ignore este email

Atenciosamente,
Equipe EmploYEAH!
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Verifica se o servidor de email está configurado
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}
