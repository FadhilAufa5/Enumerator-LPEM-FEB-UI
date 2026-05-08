<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enumerator_assessments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('enumerator_id');
            $table->string('enumerator_name');   // snapshot for display
            $table->string('enumerator_nik');    // snapshot for display
            $table->string('supervisor_name');

            // 8 criteria — scale 1-5
            $table->unsignedTinyInteger('pemahaman_tugas');           // Task understanding
            $table->unsignedTinyInteger('keterampilan_wawancara');    // Interview skills
            $table->unsignedTinyInteger('kualitas_pengisian_data');   // Data quality
            $table->unsignedTinyInteger('ketepatan_waktu');           // Timeliness & productivity
            $table->unsignedTinyInteger('etika_profesionalisme');     // Ethics & professionalism
            $table->unsignedTinyInteger('kepatuhan_sop');             // SOP compliance
            $table->unsignedTinyInteger('kemampuan_teknis');          // Technical ability
            $table->unsignedTinyInteger('evaluasi_supervisor');       // Supervisor evaluation

            $table->decimal('nilai_akhir', 4, 2)->default(0);        // average score
            $table->text('catatan')->nullable();                       // notes
            $table->string('periode')->nullable();                     // e.g. "April 2026"

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enumerator_assessments');
    }
};
