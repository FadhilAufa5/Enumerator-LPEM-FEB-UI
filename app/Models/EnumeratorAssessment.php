<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnumeratorAssessment extends Model
{
    protected $fillable = [
        'enumerator_id',
        'enumerator_name',
        'enumerator_nik',
        'supervisor_name',
        'pemahaman_tugas',
        'keterampilan_wawancara',
        'kualitas_pengisian_data',
        'ketepatan_waktu',
        'etika_profesionalisme',
        'kepatuhan_sop',
        'kemampuan_teknis',
        'evaluasi_supervisor',
        'nilai_akhir',
        'catatan',
        'periode',
    ];

    protected $casts = [
        'pemahaman_tugas'        => 'integer',
        'keterampilan_wawancara' => 'integer',
        'kualitas_pengisian_data'=> 'integer',
        'ketepatan_waktu'        => 'integer',
        'etika_profesionalisme'  => 'integer',
        'kepatuhan_sop'          => 'integer',
        'kemampuan_teknis'       => 'integer',
        'evaluasi_supervisor'    => 'integer',
        'nilai_akhir'            => 'float',
    ];

    /** Compute average before saving */
    public static function boot(): void
    {
        parent::boot();

        static::saving(function (self $model) {
            $scores = [
                $model->pemahaman_tugas,
                $model->keterampilan_wawancara,
                $model->kualitas_pengisian_data,
                $model->ketepatan_waktu,
                $model->etika_profesionalisme,
                $model->kepatuhan_sop,
                $model->kemampuan_teknis,
                $model->evaluasi_supervisor,
            ];
            $model->nilai_akhir = round(array_sum($scores) / count($scores), 2);
        });
    }
}
