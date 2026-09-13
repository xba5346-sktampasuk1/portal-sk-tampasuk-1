/**
 * Modul Pengurusan & Pemampatan Imej e-OPR
 * - Mampatkan imej kamera resolusi tinggi kepada saiz optimum (~100KB)
 * - Menyokong muat naik serentak (batch upload)
 * - Menyokong seret & lepas (drag and drop)
 * - Menyokong susun atur 2, 4, atau 6 gambar
 */

const ImageTool = {
  activeCount: 6, // 2, 4, atau 6
  imageData: {},  // { 1: dataUrl, 2: dataUrl, ... }

  /**
   * Mampatkan fail gambar menggunakan HTML5 Canvas
   * @param {File} file 
   * @param {number} maxWidth 
   * @param {number} maxHeight 
   * @param {number} quality (0.1 - 1.0)
   * @returns {Promise<string>} dataUrl
   */
  compressImage(file, maxWidth = 1200, maxHeight = 900, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        return reject(new Error('Fail yang dipilih bukan gambar yang sah.'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Kira nisbah aspek untuk penskalaan
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Tukar kepada format JPEG yang ringan
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Gagal memproses imej.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Gagal membaca fail.'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Tetapkan imej pada slot tertentu
   */
  setSlotImage(index, dataUrl) {
    this.imageData[index] = dataUrl;

    // Kemaskini dalam borang
    const uploadBox = document.getElementById(`upload-box-${index}`);
    const formImg = document.getElementById(`form-img-${index}`);
    if (uploadBox && formImg) {
      formImg.src = dataUrl;
      uploadBox.classList.add('has-image');
    }

    // Kemaskini dalam pratonton OPR
    const pvSlot = document.getElementById(`slot-${index}`);
    const pvImg = document.getElementById(`pv-img-${index}`);
    if (pvSlot && pvImg) {
      pvImg.src = dataUrl;
      pvSlot.classList.add('has-image');
    }

    if (window.StorageTool) {
      window.StorageTool.saveDraft();
    }
  },

  /**
   * Padam imej daripada slot tertentu
   */
  clearSlot(index) {
    delete this.imageData[index];

    const fileInput = document.getElementById(`gambar-${index}`);
    if (fileInput) fileInput.value = '';

    const uploadBox = document.getElementById(`upload-box-${index}`);
    const formImg = document.getElementById(`form-img-${index}`);
    if (uploadBox && formImg) {
      formImg.removeAttribute('src');
      uploadBox.classList.remove('has-image');
    }

    const pvSlot = document.getElementById(`slot-${index}`);
    const pvImg = document.getElementById(`pv-img-${index}`);
    if (pvSlot && pvImg) {
      pvImg.removeAttribute('src');
      pvSlot.classList.remove('has-image');
    }

    if (window.StorageTool) {
      window.StorageTool.saveDraft();
    }
  },

  /**
   * Tetapkan mod susun atur bilangan gambar (2, 4, atau 6)
   */
  setLayout(count) {
    this.activeCount = parseInt(count, 10) || 6;
    const photoGrid = document.querySelector('.photo-grid');
    if (photoGrid) {
      photoGrid.classList.remove('grid-2', 'grid-4', 'grid-6');
      photoGrid.classList.add(`grid-${this.activeCount}`);
    }

    for (let i = 1; i <= 6; i++) {
      const uploadCol = document.getElementById(`upload-col-${i}`);
      const pvSlot = document.getElementById(`slot-${i}`);
      
      const isVisible = i <= this.activeCount;
      if (uploadCol) uploadCol.style.display = isVisible ? '' : 'none';
      if (pvSlot) pvSlot.style.display = isVisible ? '' : 'none';
    }
  },

  /**
   * Muat naik pukal (Batch upload banyak fail sekaligus)
   */
  async handleBatchFiles(files) {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!validFiles.length) return;

    let fileIdx = 0;
    for (let i = 1; i <= this.activeCount && fileIdx < validFiles.length; i++) {
      if (!this.imageData[i]) {
        try {
          const compressed = await this.compressImage(validFiles[fileIdx]);
          this.setSlotImage(i, compressed);
          fileIdx++;
        } catch (err) {
          console.error(err);
        }
      }
    }

    // Jika masih ada fail yang belum dimasukkan dan ada slot yang terhad
    if (fileIdx < validFiles.length) {
      alert(`Hanya ${this.activeCount} gambar aktiviti dimuatkan mengikut mod susun atur semasa.`);
    }
  },

  /**
   * Inisialisasi pendengar acara untuk setiap slot imej
   */
  init() {
    for (let i = 1; i <= 6; i++) {
      const input = document.getElementById(`gambar-${i}`);
      const box = document.getElementById(`upload-box-${i}`);

      if (input) {
        input.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          try {
            const compressed = await this.compressImage(file);
            this.setSlotImage(i, compressed);
          } catch (err) {
            alert(err.message || 'Ralat memuat naik gambar');
          }
        });
      }

      // Sokongan Drag & Drop pada setiap kotak
      if (box) {
        box.addEventListener('dragover', (e) => {
          e.preventDefault();
          box.classList.add('border-amber-500', 'bg-amber-50');
        });
        box.addEventListener('dragleave', (e) => {
          e.preventDefault();
          box.classList.remove('border-amber-500', 'bg-amber-50');
        });
        box.addEventListener('drop', async (e) => {
          e.preventDefault();
          box.classList.remove('border-amber-500', 'bg-amber-50');
          const file = e.dataTransfer.files[0];
          if (file && file.type.startsWith('image/')) {
            try {
              const compressed = await this.compressImage(file);
              this.setSlotImage(i, compressed);
            } catch (err) {
              alert(err.message);
            }
          }
        });
      }
    }

    // Butang buang gambar
    document.querySelectorAll('[data-image-remove]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.clearSlot(btn.dataset.imageRemove);
      });
    });

    // Pilihan susun atur (2, 4, 6)
    const layoutSelect = document.getElementById('photo-layout-select');
    if (layoutSelect) {
      layoutSelect.addEventListener('change', (e) => {
        this.setLayout(e.target.value);
      });
      this.setLayout(layoutSelect.value || 6);
    }

    // Input muat naik pukal (batch upload)
    const batchInput = document.getElementById('batch-upload-input');
    if (batchInput) {
      batchInput.addEventListener('change', (e) => {
        this.handleBatchFiles(e.target.files);
        e.target.value = '';
      });
    }
  }
};

window.ImageTool = ImageTool;
