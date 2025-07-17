/**
 * Memformat alamat EVM agar lebih pendek dan mudah dibaca.
 * Contoh: 0x1234567890abcdef1234567890abcdef12345678 -> 0x1234...5678
 * * @param address - Alamat EVM dalam bentuk string (`0x...`).
 * @returns Alamat yang sudah diformat atau string kosong jika input tidak valid.
 */
export const formatAddress = (address?: `0x${string}`): string => {
  if (!address) {
    return "";
  }
  const start = address.substring(0, 6);
  const end = address.substring(address.length - 4);
  return `${start}...${end}`;
};

/**
 * Fungsi pembantu lain bisa ditambahkan di sini.
 * Misalnya, untuk memformat angka besar, tanggal, atau logika lainnya
 * yang dapat digunakan kembali di beberapa komponen.
 */