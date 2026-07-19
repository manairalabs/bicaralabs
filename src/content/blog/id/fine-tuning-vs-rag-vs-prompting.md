---
title: Fine-tuning vs RAG vs prompting — apa yang benar-benar dibutuhkan bisnis Anda
description: Tiga cara membuat model AI melakukan pekerjaan Anda. Kebanyakan tim langsung memilih yang termahal. Inilah cara memilih dalam urutan yang benar.
date: 2026-04-28
tag: Panduan
cover: /artwork/cover-finetune-rag.webp
dwg: bcl-03
draft: false
---

Ada tiga cara membuat model AI umum melakukan pekerjaan *spesifik* Anda. Tim sering langsung memilih yang paling mahal. Urutan yang benar justru kebalikannya.

## Mulai dengan prompting

Cukup beri tahu model apa yang harus dilakukan — dengan jelas, disertai contoh, dan aturan yang harus diikuti. Gratis, instan, dan menyelesaikan lebih banyak masalah dari perkiraan. Kuras cara ini dulu sebelum menghabiskan sepeser rupiah untuk yang lain.

## Tambahkan RAG saat butuh pengetahuan *Anda*

Retrieval-Augmented Generation memberi model akses ke dokumen Anda saat menjawab — kebijakan, data produk, tiket lama. Gunakan saat masalahnya "model tak tahu hal-hal kami", yang sebagian besar waktu. Ini menjaga jawaban tetap terkini (perbarui dokumennya, bukan modelnya) dan memungkinkan Anda mengutip sumber.

## Fine-tune saat butuh *perilaku*, bukan fakta

Fine-tuning benar-benar melatih model pada contoh Anda. Ini alat yang tepat saat Anda butuh gaya yang konsisten, format khusus, atau tugas sempit dilakukan murah dalam skala besar — dan saat prompting + RAG sudah mentok. Biayanya lebih besar, butuh data pelatihan yang baik, dan harus diulang saat model dasar berubah. Kadang sepadan; sering berlebihan.

## Keputusannya, satu baris

**Prompt dulu. Tambah RAG untuk pengetahuan. Fine-tune hanya untuk perilaku yang tak bisa didapat cara lain.**

Kebanyakan percakapan "kami perlu fine-tune" berakhir dengan prompt yang lebih baik dan sedikit retrieval — dengan biaya sebagian kecil. Keahliannya bukan mengetahui tekniknya; melainkan mengetahui mana yang benar-benar dibutuhkan masalah Anda.
