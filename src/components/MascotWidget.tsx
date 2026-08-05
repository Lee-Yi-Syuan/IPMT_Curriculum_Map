import { useState } from 'react';

export default function MascotWidget() {
  const [isHovered, setIsHovered] = useState(false);

  // 點擊直接開啟 Web 版 Gmail 撰寫郵件
  const handleClick = () => {
    const email = 'dmm@my.nthu.edu.tw';
    const subject = encodeURIComponent('<課程地圖問題反饋>');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}`;
    
    window.open(gmailUrl, '_blank');
  };

  return (
    <span
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      /* 調整位置（改-translate-y-1.5的數值） */
      className="ml-1.5 inline-flex -translate-y-1.5 cursor-pointer items-center align-middle transition-transform duration-200 hover:scale-110 active:scale-95"
      title="點擊寄信反饋問題"
    >
      <img
        src={isHovered ? '/monster.PNG' : '/monster.GIF'}
        alt="Mascot Feedback"
        className="inline-block h-6 w-6 object-contain drop-shadow-sm"
      />
    </span>
  );
}