<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Seed Permissions ───────────────────────────────
        $permissionsData = [
            // Enumerator
            ['name' => 'enumerator.view',   'label' => 'Lihat Enumerator',  'group' => 'Enumerator'],
            ['name' => 'enumerator.create', 'label' => 'Tambah Enumerator', 'group' => 'Enumerator'],
            ['name' => 'enumerator.edit',   'label' => 'Edit Enumerator',   'group' => 'Enumerator'],
            ['name' => 'enumerator.delete', 'label' => 'Hapus Enumerator',  'group' => 'Enumerator'],
            // Wilayah
            ['name' => 'wilayah.view',      'label' => 'Lihat Wilayah',     'group' => 'Wilayah'],
            ['name' => 'wilayah.create',    'label' => 'Tambah Wilayah',    'group' => 'Wilayah'],
            ['name' => 'wilayah.edit',      'label' => 'Edit Wilayah',      'group' => 'Wilayah'],
            ['name' => 'wilayah.delete',    'label' => 'Hapus Wilayah',     'group' => 'Wilayah'],
            // Survey
            ['name' => 'survey.view',       'label' => 'Lihat Survey',      'group' => 'Survey'],
            ['name' => 'survey.create',     'label' => 'Buat Survey',       'group' => 'Survey'],
            ['name' => 'survey.edit',       'label' => 'Edit Survey',       'group' => 'Survey'],
            ['name' => 'survey.delete',     'label' => 'Hapus Survey',      'group' => 'Survey'],
            // Penugasan
            ['name' => 'assignment.view',   'label' => 'Lihat Penugasan',   'group' => 'Penugasan'],
            ['name' => 'assignment.create', 'label' => 'Buat Penugasan',    'group' => 'Penugasan'],
            ['name' => 'assignment.edit',   'label' => 'Edit Penugasan',    'group' => 'Penugasan'],
            ['name' => 'assignment.delete', 'label' => 'Hapus Penugasan',   'group' => 'Penugasan'],
            // Laporan
            ['name' => 'laporan.view',      'label' => 'Lihat Laporan',     'group' => 'Laporan'],
            ['name' => 'laporan.export',    'label' => 'Export Laporan',    'group' => 'Laporan'],
            // User Management
            ['name' => 'users.view',        'label' => 'Lihat User',        'group' => 'User Management'],
            ['name' => 'users.create',      'label' => 'Tambah User',       'group' => 'User Management'],
            ['name' => 'users.edit',        'label' => 'Edit User',         'group' => 'User Management'],
            ['name' => 'users.delete',      'label' => 'Hapus User',        'group' => 'User Management'],
            ['name' => 'roles.manage',      'label' => 'Kelola Role',       'group' => 'User Management'],
        ];

        foreach ($permissionsData as $perm) {
            Permission::firstOrCreate(['name' => $perm['name']], $perm);
        }

        $all        = Permission::all();
        $viewOnly   = $all->filter(fn ($p) => str_ends_with($p->name, '.view'));
        $noUserMgmt = $all->filter(fn ($p) => !str_starts_with($p->name, 'roles') && !str_ends_with($p->name, '.delete'));
        $operational = $all->filter(fn ($p) =>
            !str_starts_with($p->name, 'roles') &&
            !str_starts_with($p->name, 'users') &&
            (str_ends_with($p->name, '.view') || str_ends_with($p->name, '.create') || str_ends_with($p->name, '.edit'))
        );

        // ── 2. Seed Roles ─────────────────────────────────────
        $adminRole = Role::firstOrCreate(['name' => 'admin'], [
            'label'       => 'Administrator',
            'description' => 'Akses penuh ke seluruh fitur sistem',
            'color'       => 'violet',
            'is_system'   => true,
        ]);
        $adminRole->permissions()->sync($all->pluck('id'));

        $supervisorRole = Role::firstOrCreate(['name' => 'supervisor'], [
            'label'       => 'Supervisor',
            'description' => 'Mengelola data dan memantau progres lapangan',
            'color'       => 'blue',
            'is_system'   => false,
        ]);
        $supervisorRole->permissions()->sync($noUserMgmt->pluck('id'));

        $operatorRole = Role::firstOrCreate(['name' => 'operator'], [
            'label'       => 'Operator',
            'description' => 'Input dan kelola data operasional survei',
            'color'       => 'emerald',
            'is_system'   => false,
        ]);
        $operatorRole->permissions()->sync($operational->pluck('id'));

        $viewerRole = Role::firstOrCreate(['name' => 'viewer'], [
            'label'       => 'Viewer',
            'description' => 'Hanya bisa melihat data tanpa perubahan apapun',
            'color'       => 'slate',
            'is_system'   => false,
        ]);
        $viewerRole->permissions()->sync($viewOnly->pluck('id'));

        // ── 3. Seed default admin user ────────────────────────
        User::firstOrCreate(['email' => 'admin@enumapp.id'], [
            'name'              => 'Super Admin',
            'password'          => Hash::make('password'),
            'role_id'           => $adminRole->id,
            'status'            => 'active',
            'email_verified_at' => now(),
        ]);
    }
}
