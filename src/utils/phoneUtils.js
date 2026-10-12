/**
 * Telefon raqamini tozalash va standart xalqaro formatga keltirish.
 *
 * QOIDALAR:
 * 1. Agar raqam '+' bilan boshlangan bo'lsa (masalan: '+90-506-363-07-73', '+998-91-090-17-02'):
 *    - Hech qanday affiks (+998) qo'shilmaydi! Chunki u boshqa davlat raqami bo'lishi mumkin (masalan Turkiya +90).
 *    - Faqat bo'shliqlar, chiziqlar (-) va qavslar tozalanib, '+' va raqamlar qoldiriladi.
 * 2. Agar raqam 9 ta raqamdan iborat bo'lib, '+' affiksi bo'lmasa (masalan: '93 962 36 32', '90-705-05-47', '907251219'):
 *    - O'zbekiston affiksi (+998) qo'shiladi: masalan '+998939623632'.
 * 3. Agar raqam 12 ta raqam bo'lib '998' bilan boshlansa va '+' bo'lmasa:
 *    - '+' qo'shiladi: '+998...'
 * 4. Bo'sh yoki noto'g'ri qiymatlar uchun null qaytariladi.
 */
function normalizePhoneNumber(rawPhone) {
  if (rawPhone === undefined || rawPhone === null) return null;
  const str = String(rawPhone).trim();
  if (!str) return null;

  const startsWithPlus = str.startsWith('+');
  // Raqam bo'lmagan barcha belgilarni tozalash (faqat raqamlar)
  const digitsOnly = str.replace(/\D/g, '');
  if (!digitsOnly) return null;

  // 1. Agar '+' bilan yozilgan bo'lsa: hech qanday affiks qo'shilmaydi!
  if (startsWithPlus) {
    return '+' + digitsOnly;
  }

  // 2. Agar '+' bo'lmasa va aynan 9 ta raqamdan iborat bo'lsa -> +998 qo'shiladi
  if (digitsOnly.length === 9) {
    return '+998' + digitsOnly;
  }

  // 3. Agar 12 ta raqam bo'lib 998 bilan boshlansa -> '+' qo'shiladi
  if (digitsOnly.length === 12 && digitsOnly.startsWith('998')) {
    return '+' + digitsOnly;
  }

  // 4. Agar 9 tadan uzun bo'lsa
  if (digitsOnly.length > 9) {
    return '+' + digitsOnly;
  }

  // 5. Aks holda
  return '+' + digitsOnly;
}

module.exports = {
  normalizePhoneNumber
};
