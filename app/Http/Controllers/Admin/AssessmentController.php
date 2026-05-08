<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EnumeratorAssessment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssessmentController extends Controller
{
    /** Mock enumerator list — replace with real Enumerator model later */
    private function mockEnumerators(): array
    {
        return [
            ['id' => 1, 'name' => 'Ahmad Fauzi',   'nik' => '3201010101010001'],
            ['id' => 2, 'name' => 'Siti Rahayu',   'nik' => '3201010101010002'],
            ['id' => 3, 'name' => 'Budi Santoso',  'nik' => '3201010101010003'],
            ['id' => 4, 'name' => 'Dewi Lestari',  'nik' => '3201010101010004'],
            ['id' => 5, 'name' => 'Rizki Pratama', 'nik' => '3201010101010005'],
            ['id' => 6, 'name' => 'Putri Amalia',  'nik' => '3201010101010006'],
        ];
    }

    public function index()
    {
        $assessments = EnumeratorAssessment::orderByDesc('created_at')->get();

        return Inertia::render('admin/penilaian/index', [
            'assessments' => $assessments,
            'enumerators' => $this->mockEnumerators(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'enumerator_id'          => 'required|integer',
            'enumerator_name'        => 'required|string|max:255',
            'enumerator_nik'         => 'required|string|max:20',
            'supervisor_name'        => 'required|string|max:255',
            'pemahaman_tugas'        => 'required|integer|min:1|max:5',
            'keterampilan_wawancara' => 'required|integer|min:1|max:5',
            'kualitas_pengisian_data'=> 'required|integer|min:1|max:5',
            'ketepatan_waktu'        => 'required|integer|min:1|max:5',
            'etika_profesionalisme'  => 'required|integer|min:1|max:5',
            'kepatuhan_sop'          => 'required|integer|min:1|max:5',
            'kemampuan_teknis'       => 'required|integer|min:1|max:5',
            'evaluasi_supervisor'    => 'required|integer|min:1|max:5',
            'catatan'                => 'nullable|string',
            'periode'                => 'nullable|string|max:50',
        ]);

        EnumeratorAssessment::create($validated);

        return redirect()->back()->with('success', 'Penilaian berhasil disimpan.');
    }

    public function update(Request $request, EnumeratorAssessment $assessment)
    {
        $validated = $request->validate([
            'supervisor_name'        => 'required|string|max:255',
            'pemahaman_tugas'        => 'required|integer|min:1|max:5',
            'keterampilan_wawancara' => 'required|integer|min:1|max:5',
            'kualitas_pengisian_data'=> 'required|integer|min:1|max:5',
            'ketepatan_waktu'        => 'required|integer|min:1|max:5',
            'etika_profesionalisme'  => 'required|integer|min:1|max:5',
            'kepatuhan_sop'          => 'required|integer|min:1|max:5',
            'kemampuan_teknis'       => 'required|integer|min:1|max:5',
            'evaluasi_supervisor'    => 'required|integer|min:1|max:5',
            'catatan'                => 'nullable|string',
            'periode'                => 'nullable|string|max:50',
        ]);

        $assessment->update($validated);

        return redirect()->back()->with('success', 'Penilaian berhasil diperbarui.');
    }

    public function destroy(EnumeratorAssessment $assessment)
    {
        $assessment->delete();
        return redirect()->back()->with('success', 'Penilaian berhasil dihapus.');
    }
}
