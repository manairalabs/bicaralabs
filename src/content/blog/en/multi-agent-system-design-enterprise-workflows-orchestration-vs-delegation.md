---
title: "Desain Multi-Agent System untuk Enterprise Workflow: Kapan Memakai Orchestration vs Delegation"
description: "Panduan teknis memilih orchestration atau delegation untuk multi-agent system enterprise, termasuk failure mode, routing, memory, tool access, evals, dan governance."
date: 2026-09-03
cover: "/blog/images/54c3e799d9b1.webp"
tag: "multi-agent system design for enterprise workflows"
draft: false
---

![Ilustrasi arsitektur multi-agent enterprise dengan coordinator yang merutekan tugas ke specialist agents](/blog/images/54c3e799d9b1.webp)

Desain **multi-agent system** untuk workflow enterprise bukan soal menambah lebih banyak agent. Yang lebih penting adalah memilih pola kontrol yang tepat. Dua pola yang paling sering muncul adalah **orchestration** dan **delegation**. Keduanya bisa bekerja. Keduanya juga bisa gagal saat masuk ke sistem produksi.

Jika keputusan ini salah di awal, gejala yang muncul biasanya sama: agent saling melempar tugas, tool dipakai di luar batasnya, state tersembunyi sulit ditelusuri, dan prompt menjadi tambalan untuk masalah arsitektur. Karena itu, pemilihan antara orchestration dan delegation sebaiknya dilihat sebagai keputusan sistem, bukan sekadar keputusan prompt.

Artikel ini membahas kapan masing-masing pola layak dipakai, failure mode yang umum muncul di production, serta pola praktis untuk routing, memory, tool access, evals, dan governance sebelum sistem dikirim ke infrastruktur klien.

## Orchestration vs delegation in multi-agent systems

Secara sederhana, **orchestration** berarti ada satu coordinator agent atau service layer yang memegang kontrol utama. Ia menerima objective, memecah pekerjaan, memilih specialist agent yang relevan, lalu menggabungkan hasilnya. Alur utamanya eksplisit. State lebih mudah diamati. Guardrail juga lebih mudah ditempatkan di satu titik kontrol.

Sebaliknya, **delegation** memberi lebih banyak otonomi pada agent. Satu agent dapat memutuskan untuk menyerahkan subtask ke agent lain berdasarkan konteks yang ia lihat. Pola ini lebih fleksibel untuk pekerjaan yang tidak sepenuhnya bisa dipetakan di awal, terutama ketika subtask bersifat dinamis atau bercabang.

Kapan memakai **orchestration**?

- Saat workflow enterprise sudah cukup jelas langkah-langkahnya.
- Saat kepatuhan, auditability, dan kontrol tool access menjadi prioritas.
- Saat output harus konsisten lintas kasus.
- Saat Anda perlu memastikan siapa melakukan apa, dengan input apa, dan keputusan apa yang diambil.

Kapan memakai **delegation**?

- Saat ruang masalah lebih terbuka dan tidak semua subtask dapat diprediksi di awal.
- Saat specialist agent memang punya peran domain yang jelas dan bisa mengambil keputusan lokal dengan aman.
- Saat latency tambahan dari coordinator masih bisa diterima, atau justru pengurangan handoff manual memberi hasil lebih baik.

Dalam praktik enterprise, pola yang paling aman jarang murni salah satu. Yang lebih umum adalah **bounded delegation**: coordinator tetap mengontrol objective, policy, dan batas tool access, sementara specialist agent boleh mendelegasikan subtask tertentu dalam ruang yang sudah dibatasi.

## The failure modes that show up in production

Di demo, banyak sistem multi-agent terlihat rapi. Di production, masalahnya muncul cepat.

**1. Loops dan handoff tanpa akhir**  
Agent A mengirim ke Agent B. Agent B merasa konteksnya kurang lalu melempar kembali ke Agent A, atau ke Agent C yang akhirnya kembali lagi. Jika tidak ada termination condition yang tegas, sistem menghabiskan token dan waktu tanpa menambah kualitas hasil.

**2. Tool misuse**  
Agent diberi terlalu banyak tool, lalu mulai memilih tool yang salah karena deskripsi tool ambigu atau karena objective tidak cukup sempit. Di enterprise workflow, ini berbahaya. Tool bukan sekadar kemampuan tambahan; ia adalah permukaan risiko.

**3. Hidden state**  
Keputusan penting tersimpan di memori percakapan, prompt yang tidak terversi, atau intermediate context yang tidak tercatat rapi. Saat hasil salah, tim engineering sulit menjawab pertanyaan dasar: state apa yang dibaca agent, siapa yang mengubahnya, dan kapan.

**4. Brittle prompts**  
Arsitektur yang lemah sering ditutup dengan prompt yang makin panjang. Hasilnya terlihat baik pada beberapa contoh, lalu runtuh saat variasi input meningkat. Prompt memang penting, tetapi prompt tidak boleh menjadi pengganti kontrak antar-komponen.

**5. Ownership yang kabur**  
Jika semua agent boleh melakukan routing, validasi, dan eksekusi tool sekaligus, tidak ada titik yang benar-benar bertanggung jawab atas kualitas hasil akhir. Saat insiden terjadi, observability ada, tetapi accountability tidak ada.

Karena itu, sistem multi-agent yang layak dikirim ke klien harus dirancang untuk **traceability** sejak awal, bukan ditambahkan belakangan.

## A practical pattern for routing, memory, and tool access

Pola yang paling praktis untuk banyak workflow enterprise adalah memisahkan sistem ke dalam empat lapisan:

**1. Router atau coordinator**  
Komponen ini menerima objective, membaca policy, dan menentukan jalur eksekusi. Ia tidak perlu menjadi agent yang “paling pintar”. Tugasnya adalah menjaga disiplin alur.

**2. Specialist agents**  
Setiap agent punya domain sempit. Misalnya: extraction, classification, drafting, validation, atau exception handling. Semakin jelas kontraknya, semakin kecil risiko prompt bleed dan tool misuse.

**3. Tool gateway**  
Jangan biarkan setiap agent bicara langsung ke semua tool. Bungkus tool lewat layer akses yang mencatat permintaan, menerapkan izin, dan memvalidasi input-output. Ini penting untuk governance.

**4. State and memory layer**  
Pisahkan working memory, task state, dan long-term context. Tidak semua hal harus masuk ke conversational memory. Simpan hanya konteks yang benar-benar diperlukan, dengan skema yang eksplisit.

Beberapa aturan desain yang biasanya membantu:

- **Gunakan structured handoff**, bukan sekadar natural-language handoff. Setiap agent sebaiknya menerima objective, input schema, batas keputusan, dan expected output yang jelas.
- **Batasi tool per agent**. Lebih sedikit tool biasanya berarti keputusan lebih stabil.
- **Tentukan stop conditions** di setiap cabang. Jika confidence rendah atau data tidak lengkap, naikkan ke jalur fallback, bukan teruskan delegasi.
- **Pisahkan reasoning dari action** sejauh mungkin. Tidak semua reasoning perlu menjadi tindakan yang menyentuh sistem eksternal.
- **Catat intermediate artifacts** yang penting. Ringkasan, klasifikasi, dan keputusan routing sebaiknya tersimpan sebagai state yang bisa diaudit.

Dengan pola ini, delegation tetap bisa dipakai, tetapi berada dalam pagar yang jelas. Ini biasanya lebih cocok untuk kebutuhan production daripada kebebasan penuh antar-agent.

## What to evaluate before shipping to client infra

**Evals bukan tambahan riset. Evals adalah syarat shipping.** Tanpa evals, tim hanya tahu sistem terlihat bagus pada beberapa contoh. Itu belum cukup untuk enterprise workflow.

Sebelum deployment ke infrastruktur klien, minimal evaluasi hal-hal berikut:

**Task success**  
Apakah sistem menyelesaikan objective dengan benar pada skenario normal dan edge case yang sudah didefinisikan?

**Routing quality**  
Apakah coordinator memilih agent yang tepat? Apakah delegation terjadi hanya saat memang diperlukan?

**Tool correctness**  
Apakah tool yang dipanggil sesuai konteks? Apakah input ke tool valid? Apakah output tool ditangani dengan benar?

**Termination behavior**  
Apakah loop terdeteksi? Apakah ada batas retry, escalation path, dan fallback yang konsisten?

**State integrity**  
Apakah memory yang dibawa antar-step memang relevan? Apakah ada state yang bocor, duplikat, atau tidak sinkron?

**Governance and policy adherence**  
Apakah agent mematuhi batas akses, aturan approval, dan logging requirement?

Di lingkungan klien, kualitas model saja tidak cukup. Yang dinilai adalah perilaku sistem secara keseluruhan. Karena itu, evaluasi harus mencakup **workflow**, **tooling**, **state**, dan **policy** sekaligus.

## Where multi-agent systems fit — and where they do not

Multi-agent system cocok ketika masalah memang terdiri dari beberapa peran yang berbeda, ada kebutuhan koordinasi antar-subtask, dan nilai bisnis muncul dari workflow yang berjalan terus-menerus, bukan dari satu prompt tunggal.

Contohnya, sistem seperti ini masuk akal ketika ada kombinasi routing, validasi, ekstraksi, drafting, dan decision support dalam satu alur kerja yang harus bisa diamati dan dikendalikan.

Tetapi tidak semua masalah perlu multi-agent. Jika satu agent dengan tool yang dibatasi sudah cukup, jangan pecah sistem terlalu cepat. Menambah agent berarti menambah handoff, state, observability surface, dan area kegagalan. Kompleksitas hanya layak dibayar jika memang memberi kontrol atau kualitas yang lebih baik.

Aturan praktisnya sederhana: **mulai dari arsitektur paling kecil yang bisa diaudit**. Tambahkan specialist agent hanya ketika ada alasan yang jelas, misalnya kebutuhan isolasi peran, perbedaan tool access, atau kebutuhan routing yang memang tidak nyaman ditangani dalam satu komponen.

Untuk tim enterprise, pertanyaan yang tepat bukan “bisakah kita membuat banyak agent?” tetapi “struktur kontrol mana yang membuat workflow ini aman, dapat diaudit, dan benar-benar bisa dikirim ke production?”

Jika jawabannya menuntut kontrol ketat, pilih orchestration. Jika jawabannya menuntut fleksibilitas lokal dalam batas yang jelas, gunakan delegation yang dibatasi. Yang terpenting, jangan berhenti di konsep. Sistem seperti ini harus dibangun, diuji, dideploy, lalu dioptimalkan di lingkungan nyata.

## Penutup

Desain multi-agent system untuk enterprise workflow adalah keputusan engineering. Orchestration memberi kontrol, auditability, dan konsistensi. Delegation memberi fleksibilitas, tetapi harus dibatasi dengan kontrak, state model, dan tool governance yang jelas. Dalam production, pemenangnya bukan pola yang paling menarik di demo. Pemenangnya adalah pola yang tetap stabil saat berhadapan dengan workflow nyata.

Jika tim Anda sedang merancang AI agent atau workflow enterprise yang harus benar-benar berjalan di infrastruktur klien, **Talk to Bicara Labs**. Kami membangun sistem AI yang siap dipakai di production — dari design sampai deployment — bukan sekadar memberi saran.

30-min scoping call: https://bicaralabs.com/contact