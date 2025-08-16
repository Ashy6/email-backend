import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.createTransporter();
  }

  private createTransporter() {
    // 如果配置了SMTP，使用SMTP发送
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // 开发环境使用测试账户
      this.logger.warn('未配置SMTP，使用测试模式');
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass',
        },
      });
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"用户管理系统" <noreply@example.com>',
      to: email,
      subject: '登录验证码',
      html: this.getVerificationCodeTemplate(code),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`验证码邮件已发送到 ${email}: ${info.messageId}`);
      
      // 在开发环境中显示预览链接
      if (process.env.NODE_ENV === 'development') {
        this.logger.log(`预览链接: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`发送验证码邮件失败: ${error.message}`, error.stack);
      throw new Error('邮件发送失败');
    }
  }

  private getVerificationCodeTemplate(code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>登录验证码</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .content {
            padding: 40px 30px;
          }
          .code {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            padding: 20px;
            margin: 30px 0;
            color: #495057;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>用户管理系统</h1>
            <p>登录验证码</p>
          </div>
          <div class="content">
            <p>您好！</p>
            <p>您正在登录用户管理系统，请使用以下验证码完成登录：</p>
            
            <div class="code">${code}</div>
            
            <div class="warning">
              <strong>安全提醒：</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>验证码有效期为 5 分钟</li>
                <li>请勿将验证码告诉他人</li>
                <li>如非本人操作，请忽略此邮件</li>
              </ul>
            </div>
            
            <p>如果您没有尝试登录，请忽略此邮件。</p>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复。</p>
            <p>&copy; ${new Date().getFullYear()} 用户管理系统. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"用户管理系统" <noreply@example.com>',
      to: email,
      subject: '欢迎加入用户管理系统',
      html: this.getWelcomeTemplate(fullName),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`欢迎邮件已发送到 ${email}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`发送欢迎邮件失败: ${error.message}`, error.stack);
      // 欢迎邮件发送失败不应该阻止用户注册流程
    }
  }

  private getWelcomeTemplate(fullName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>欢迎加入</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .content {
            padding: 40px 30px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
          }
          .features {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .features ul {
            margin: 0;
            padding-left: 20px;
          }
          .features li {
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 欢迎加入！</h1>
            <p>用户管理系统</p>
          </div>
          <div class="content">
            <p>亲爱的 ${fullName}，</p>
            <p>欢迎加入用户管理系统！您的账户已成功创建。</p>
            
            <div class="features">
              <h3>您现在可以：</h3>
              <ul>
                <li>管理个人资料信息</li>
                <li>查看系统统计数据</li>
                <li>根据权限管理用户和角色</li>
                <li>配置系统设置</li>
              </ul>
            </div>
            
            <p>如果您有任何问题或需要帮助，请随时联系我们的支持团队。</p>
            
            <p>祝您使用愉快！</p>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复。</p>
            <p>&copy; ${new Date().getFullYear()} 用户管理系统. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}