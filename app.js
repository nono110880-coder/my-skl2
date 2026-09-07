const { createApp } = Vue;

axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';

// Inject JWT Token
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('skl_jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const getLocalDate = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
};

createApp({
    data() {
        return {
            apiURL: '/api/skl',
            searchQuery: '',
            filterProdi: '',
            dataList: [],
            form: {
                id: null,
                jurusan: '',
                program_studi: '',
                nomor_surat: '',
                nama_mahasiswa: '',
                nim: '',
                tempat_lahir: '',
                tanggal_lahir: '',
                tanggal_lulus: '',
                judul_tugas_akhir: '',
                nin: '',
                nomor_transkrip: '',
                ipk: '',
                predikat: '',
                tanggal_pembuatan_surat: getLocalDate()
            }
        }
    },

    computed: {
        filteredData() {
            return this.dataList.filter(item => {
                // 1. Cek apakah teks pencarian cocok dengan NIM atau Nama
                const cocokPencarian = item.nim.includes(this.searchQuery) ||
                    item.nama_mahasiswa.toLowerCase().includes(this.searchQuery.toLowerCase());

                // 2. Cek apakah program studi cocok dengan dropdown (jika kosong, tampilkan semua)
                const cocokProdi = this.filterProdi === '' || item.program_studi === this.filterProdi;

                // Tampilkan data HANYA JIKA kedua syarat di atas terpenuhi
                return cocokPencarian && cocokProdi;
            });
        }
    },

    methods: {
        async loadData() {
            try {
                const response = await axios.get(this.apiURL);
                const dataDariBackend = response.data.data;
                this.dataList = Array.isArray(dataDariBackend) ? dataDariBackend : [];
            } catch (error) {
                console.error('Error loading data:', error);
                this.dataList = [];
                alert('Gagal memuat data. Pastikan server backend sudah berjalan.');
            }
        },

        async saveData() {
            try {
                const dataYangDikirim = { ...this.form };
                const idData = dataYangDikirim.id;

                delete dataYangDikirim.id;

                let savedId = null;

                if (idData) {
                    await axios.put(`${this.apiURL}/${idData}`, dataYangDikirim);
                    savedId = idData;
                } else {
                    const response = await axios.post(this.apiURL, dataYangDikirim);
                    if (response.data && response.data.data && response.data.data.length > 0) {
                        savedId = response.data.data[0].id;
                    }
                }

                const fileInput = this.$refs.transkripInput;
                if (fileInput && fileInput.files.length > 0 && savedId) {
                    const formData = new FormData();
                    formData.append('transkrip', fileInput.files[0]);

                    try {
                        await axios.post(`${this.apiURL}/upload-transkrip/${savedId}`, formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        alert(idData ? "Data dan Transkrip berhasil diperbarui!" : "Data dan Transkrip berhasil disimpan!");
                    } catch (uploadError) {
                        console.error("Upload error:", uploadError);
                        alert("Data tersimpan, tapi gagal mengunggah transkrip: " + (uploadError.response?.data?.message || uploadError.message));
                    }
                } else {
                    alert(idData ? "Data berhasil diperbarui!" : "Data berhasil disimpan!");
                }

                this.clearForm();
                this.loadData();
            } catch (error) {
                const pesanError = error.response?.data?.message || "Gagal menyimpan/memperbarui. Pastikan server backend sudah menyala.";
                alert(pesanError);
                console.error("Detail Error:", error);
            }
        },

        editData(item) {
            this.form = { ...item };
        },

        async deleteData() {
            if (confirm('Yakin hapus data ini?')) {
                try {
                    await axios.delete(`${this.apiURL}/${this.form.id}`);
                    alert("Data berhasil dihapus");
                    this.clearForm();
                    this.loadData();
                } catch (error) {
                    alert("Gagal hapus data");
                }
            }
        },

        async cetakPDF(id) {
            const newWindow = window.open('', '_blank');
            if (newWindow) newWindow.document.write('Memuat dokumen PDF...');
            try {
                const response = await axios.get(`${this.apiURL}/cetak/${id}?t=${new Date().getTime()}`, { responseType: 'blob' });
                const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                if (newWindow) newWindow.location.href = fileURL;
                else window.open(fileURL, '_blank');
            } catch (error) {
                if (newWindow) newWindow.close();
                alert("Gagal mencetak PDF.");
            }
        },

        async cetakTranskrip(id) {
            const newWindow = window.open('', '_blank');
            if (newWindow) newWindow.document.write('Memuat dokumen Transkrip...');
            try {
                const response = await axios.get(`${this.apiURL}/cetak-transkrip/${id}?t=${new Date().getTime()}`, { responseType: 'blob' });
                const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                if (newWindow) newWindow.location.href = fileURL;
                else window.open(fileURL, '_blank');
            } catch (error) {
                if (newWindow) newWindow.close();
                alert("Gagal mencetak Transkrip.");
            }
        },

        async cetakBerkas(id) {
            const newWindow = window.open('', '_blank');
            if (newWindow) newWindow.document.write('Memuat dokumen Berkas...');
            try {
                const response = await axios.get(`${this.apiURL}/cetak-berkas/${id}?t=${new Date().getTime()}`, { responseType: 'blob' });
                const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                if (newWindow) newWindow.location.href = fileURL;
                else window.open(fileURL, '_blank');
            } catch (error) {
                if (newWindow) newWindow.close();
                alert("Gagal mencetak Berkas.");
            }
        },

        clearForm() {
            this.form = {
                id: null,
                jurusan: '',
                program_studi: '',
                tanggal_pembuatan_surat: getLocalDate()
            };
            if (this.$refs.transkripInput) {
                this.$refs.transkripInput.value = '';
            }
        },

        resetProdi() {
            this.form.program_studi = '';
        },

        exportExcel() {
            if (this.filteredData.length === 0) {
                alert("Tidak ada data untuk diekspor!");
                return;
            }

            const dataSiapExport = this.filteredData.map((item, index) => ({
                "No": index + 1,
                "NIM": item.nim,
                "Nama Mahasiswa": item.nama_mahasiswa,
                "Jurusan": item.jurusan,
                "Program Studi": item.program_studi,
                "Tempat Lahir": item.tempat_lahir,
                "Tanggal Lahir": item.tanggal_lahir,
                "Nomor Surat SKL": item.nomor_surat,
                "Tanggal Surat": item.tanggal_pembuatan_surat,
                "Judul Tugas Akhir": item.judul_tugas_akhir,
                "Tanggal Lulus": item.tanggal_lulus,
                "NIN (No Ijasah)": item.nin,
                "Nomor Transkrip": item.nomor_transkrip,
                "IPK": item.ipk,
                "Predikat": item.predikat
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataSiapExport);
            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(workbook, worksheet, "Data Lulusan");
            XLSX.writeFile(workbook, "Rekap_Data_SKL_Mahasiswa.xlsx");
        },

        triggerFileInput() {
            this.$refs.fileInput.click();
        },

        async processFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const excelData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

                    if (excelData.length === 0) {
                        alert("File Excel kosong atau format tidak sesuai!");
                        this.$refs.fileInput.value = '';
                        return;
                    }

                    if (!confirm(`Ditemukan ${excelData.length} baris data. Mulai proses import ke database?`)) {
                        this.$refs.fileInput.value = '';
                        return;
                    }

                    let successCount = 0;
                    let skipCount = 0;

                    const payloadArray = excelData.map(row => ({
                        nim: String(row["NIM"] || ''),
                        nama_mahasiswa: String(row["Nama Mahasiswa"] || ''),
                        jurusan: String(row["Jurusan"] || ''),
                        program_studi: String(row["Program Studi"] || ''),
                        tempat_lahir: String(row["Tempat Lahir"] || ''),
                        tanggal_lahir: row["Tanggal Lahir"] || null,
                        nomor_surat: String(row["Nomor Surat SKL"] || ''),
                        tanggal_pembuatan_surat: row["Tanggal Surat"] || getLocalDate(),
                        judul_tugas_akhir: String(row["Judul Tugas Akhir"] || ''),
                        tanggal_lulus: row["Tanggal Lulus"] || null,
                        nin: String(row["NIN (No Ijasah)"] || ''),
                        nomor_transkrip: String(row["Nomor Transkrip"] || ''),
                        ipk: row["IPK"] ? parseFloat(row["IPK"]) : 0,
                        predikat: String(row["Predikat"] || '')
                    }));

                    try {
                        const response = await axios.post(this.apiURL, payloadArray);
                        alert(response.data.message || 'Proses Import Selesai!');
                        this.loadData();
                    } catch (err) {
                        const pesanError = err.response?.data?.message || "Gagal menyimpan data bulk.";
                        alert(pesanError);
                        console.error("Detail Error Bulk Insert:", err);
                    }


                } catch (error) {
                    alert("Gagal membaca file Excel. Pastikan formatnya benar.");
                    console.error(error);
                } finally {
                    this.$refs.fileInput.value = '';
                }
            };

            reader.readAsArrayBuffer(file);
        }
    },
    mounted() {
        const token = localStorage.getItem('skl_jwt_token');

        if (!token) {
            window.location.href = '/login.html';
        } else {
            this.loadData();
        }
    }
}).mount('#app');