import nodemailer from 'nodemailer';

// Cấu hình transporter cho Gmail
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com', // Email gửi
      pass: process.env.EMAIL_PASS || 'your-app-password'     // App password
    }
  });
};

// Gửi email liên hệ
const sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ"
      });
    }

    const transporter = createTransporter();

    // Tạo nội dung email
    const subjectMap = {
      'general': 'Tư vấn chung',
      'product': 'Hỏi về sản phẩm',
      'order': 'Hỗ trợ đơn hàng',
      'complaint': 'Khiếu nại',
      'partnership': 'Hợp tác'
    };

    const emailSubject = `[PERFUME STORE] ${subjectMap[subject] || 'Liên hệ'} - ${name}`;
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333; text-align: center; border-bottom: 2px solid #f39c12; padding-bottom: 10px;">
          📧 Tin nhắn liên hệ mới
        </h2>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">Thông tin khách hàng:</h3>
          <p><strong>👤 Họ tên:</strong> ${name}</p>
          <p><strong>📧 Email:</strong> ${email}</p>
          <p><strong>📞 Số điện thoại:</strong> ${phone || 'Không cung cấp'}</p>
          <p><strong>📋 Chủ đề:</strong> ${subjectMap[subject] || subject}</p>
        </div>
        
        <div style="background: #fff; padding: 15px; border-left: 4px solid #f39c12; margin: 20px 0;">
          <h3 style="color: #555; margin-top: 0;">💬 Nội dung tin nhắn:</h3>
          <p style="line-height: 1.6; color: #666;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">
            📅 Thời gian: ${new Date().toLocaleString('vi-VN')}
          </p>
          <p style="color: #888; font-size: 12px;">
            🌐 Gửi từ website Perfume Store
          </p>
        </div>
      </div>
    `;

    // Cấu hình email
    const mailOptions = {
      from: `"Perfume Store Contact" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: 'lethinguyenxuyen2003@gmail.com', // Email của bạn
      subject: emailSubject,
      html: emailContent,
      replyTo: email // Cho phép reply trực tiếp về email khách hàng
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi trong 24h."
    });

  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau."
    });
  }
};

export { sendContactEmail };
