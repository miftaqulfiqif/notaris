export interface DemoRequestData {
    namaInstansi: string;
    alamatKantor: string;
    namaPIC: string;
    emailInstansi: string;
    deskripsiKebutuhan: string;
}

export function buildDemoRequestMailto(data: DemoRequestData): string {
    const { namaInstansi, alamatKantor, namaPIC, emailInstansi, deskripsiKebutuhan } = data;

    const subject = `[Request Demo] ${namaInstansi} - ${namaPIC}`;

    const body = `Halo Tim Notarix,

Saya ingin mengajukan request demo layanan Notarix.

================================
DATA INSTANSI
================================
Nama Instansi  : ${namaInstansi}
Alamat Kantor  : ${alamatKantor}
Nama PIC       : ${namaPIC}
Email          : ${emailInstansi}

================================
KEBUTUHAN
================================
${deskripsiKebutuhan}

================================

Mohon hubungi saya untuk mengatur jadwal meeting demo.

Terima kasih,
${namaPIC}`;

    return `https://mail.google.com/mail/?view=cm&fs=1&to=notarix@jmlnotaris.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}