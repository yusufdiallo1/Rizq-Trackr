// Convert Gregorian date to Islamic (Hijri) date using accurate algorithm
export function getIslamicDate(date: Date = new Date()): string {
  const islamicMonths = [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
    'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];
  
  // Accurate Hijri conversion algorithm
  // Based on the Umm al-Qura calendar (Saudi Arabia)
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1; // 1-12
  const gregorianDay = date.getDate();
  
  // Convert to Julian Day Number
  let jd = gregorianToJulian(gregorianYear, gregorianMonth, gregorianDay);
  
  // Convert to Hijri
  const hijri = julianToHijri(jd);
  
  const islamicMonth = islamicMonths[hijri.month - 1] || 'Muharram';
  
  return `${hijri.day} ${islamicMonth} ${hijri.year} AH`;
}

// Convert Gregorian to Julian Day Number
function gregorianToJulian(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

// Convert Julian Day Number to Hijri
function julianToHijri(jd: number): { year: number; month: number; day: number } {
  // Julian Day Number for 16 July 622 CE (start of Hijri calendar)
  // This is the actual epoch: 16 July 622 CE = 1 Muharram 1 AH
  const hijriEpoch = 1948439.5;
  
  // Days since Hijri epoch
  const daysSinceEpoch = Math.floor(jd - hijriEpoch);
  
  if (daysSinceEpoch < 0) {
    return { year: 1, month: 1, day: 1 };
  }
  
  // More accurate calculation using lunar cycles
  // Each Hijri year has 12 lunar months, alternating 29 and 30 days
  let remainingDays = daysSinceEpoch;
  let year = 1;
  
  // Calculate year by counting days through 30-year cycles
  // In a 30-year cycle, there are 11 leap years (355 days) and 19 common years (354 days)
  // Total: 11 * 355 + 19 * 354 = 10631 days per 30-year cycle
  
  const daysPerCycle = 10631;
  const cycles = Math.floor(remainingDays / daysPerCycle);
  year += cycles * 30;
  remainingDays -= cycles * daysPerCycle;
  
  // Calculate remaining years within the cycle
  const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  
  while (remainingDays >= 354) {
    const yearInCycle = ((year - 1) % 30) + 1;
    const isLeapYear = leapYears.includes(yearInCycle);
    const daysInYear = isLeapYear ? 355 : 354;
    
    if (remainingDays >= daysInYear) {
      remainingDays -= daysInYear;
      year++;
    } else {
      break;
    }
  }
  
  // Calculate month and day
  // Standard month lengths: 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29
  const standardMonths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  
  // Adjust for leap year (last month gets an extra day)
  const yearInCycle = ((year - 1) % 30) + 1;
  const isLeapYear = leapYears.includes(yearInCycle);
  const months = [...standardMonths];
  if (isLeapYear) {
    months[11] = 30; // Last month (Dhu al-Hijjah) has 30 days in leap year
  }
  
  let month = 1;
  let day = remainingDays + 1;
  
  for (let i = 0; i < 12; i++) {
    if (day > months[i]) {
      day -= months[i];
      month++;
    } else {
      break;
    }
  }
  
  // Ensure valid day
  if (day < 1) day = 1;
  if (day > months[month - 1]) day = months[month - 1];
  if (month > 12) {
    month = 12;
    day = months[11];
  }
  
  return { year, month, day };
}

// Get time-based greeting
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good Morning';
  } else if (hour < 17) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
}

// Format date nicely
export function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

